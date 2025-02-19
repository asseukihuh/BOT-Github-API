// IMPORT DISCORD JS
import { Client, GatewayIntentBits } from 'discord.js';
import fs from 'fs';

const TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';
const configFile = 'config.json';
const repoConfig = new Map();

function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toISOString().replace('T', ' ').split('.')[0];
}

function loadConfig() {
    if (fs.existsSync(configFile)) {
        try {
            const data = fs.readFileSync(configFile, 'utf8');
            const parsedData = JSON.parse(data);
            for (const [channelId, config] of Object.entries(parsedData)) {
                repoConfig.set(channelId, config);
            }
            console.log("Loaded repository configurations.");
        } catch (error) {
            console.error("Error loading config file:", error);
        }
    }
}

function saveConfig() {
    try {
        fs.writeFileSync(configFile, JSON.stringify(Object.fromEntries(repoConfig), null, 4));
        console.log("Repository configurations saved.");
    } catch (error) {
        console.error("Error saving config file:", error);
    }
}

async function fetchCommit(username) {
    const url = `https://api.github.com/repos/${username}/commits`;

    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${GITHUB_TOKEN}`,
                "User-Agent": "discord-bot"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch commits");
        const commits = await response.json();
        return commits[0];
    } catch (error) {
        console.error("Error fetching commits:", error);
        return null;
    }
}

async function checkCommits() {
    for (const [channelId, config] of repoConfig.entries()) {
        const latestCommit = await fetchCommit(config.username);
        if (!latestCommit) continue;

        if (config.lastCommit !== latestCommit.sha) {
            config.lastCommit = latestCommit.sha;
            saveConfig();

            const channel = client.channels.cache.get(channelId);
            if (channel) {
                channel.send(
                    `**Commited at :** ${formatTimestamp(latestCommit.commit.author.date)}\n` +
                    `**By :** ${latestCommit.author.login}\n` +
                    `**Message :** ${latestCommit.commit.message}\n` +
                    `[**View Commit**](${latestCommit.html_url})`
                );
            }
        }
    }
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log('Bot is online!');
    loadConfig();
    setInterval(checkCommits, 60000);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!config_commit')) {
        const args = message.content.slice(14).trim().split(/\s+/);
        if (args.length !== 2) {
            return message.reply("**Usage:** `!config_commit <user> <repository>`");
        }

        const newUsername = `${args[0]}/${args[1]}`;

        try {
            const response = await fetch(`https://api.github.com/repos/${newUsername}`, {
                headers: {
                    "Authorization": `Bearer ${GITHUB_TOKEN}`,
                    "User-Agent": "discord-bot"
                }
            });

            if (!response.ok) {
                return message.reply("Repository not found! Please check the username and repository name.");
            }

            repoConfig.set(message.channel.id, { username: newUsername, lastCommit: null });
            saveConfig();

            message.reply(`This channel is now tracking: **${newUsername}**`);
            console.log(`Updated repository path for channel ${message.channel.id} to: ${newUsername}`);
        } catch (error) {
            console.error("Error checking repository:", error);
            message.reply("Error validating the repository. Please try again.");
        }
    }
});

client.login(TOKEN);

