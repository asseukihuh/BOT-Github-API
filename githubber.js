// IMPORT DISCORD JS
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'fs';

const TOKEN = 'YOUR_DISCORD_BOT_TOKEN';
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';
const CLIENT_ID = 'YOUR_BOT_CLIENT_ID';
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
        GatewayIntentBits.GuildMessages
    ]
});

const commands = [
    new SlashCommandBuilder()
        .setName('config_commit')
        .setDescription('Set up GitHub commit tracking for this channel.')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('GitHub username or organization')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('repository')
                .setDescription('GitHub repository name')
                .setRequired(true)
        )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function registerCommands() {
    try {
        console.log("Registering slash commands...");
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log("Slash commands registered successfully.");
    } catch (error) {
        console.error("Error registering slash commands:", error);
    }
}

client.once('ready', async () => {
    console.log('Bot is online!');
    loadConfig();
    await registerCommands();
    setInterval(checkCommits, 60000);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'config_commit') {
        const user = interaction.options.getString('user');
        const repository = interaction.options.getString('repository');
        const newUsername = `${user}/${repository}`;

        try {
            const response = await fetch(`https://api.github.com/repos/${newUsername}`, {
                headers: {
                    "Authorization": `Bearer ${GITHUB_TOKEN}`,
                    "User-Agent": "discord-bot"
                }
            });

            if (!response.ok) {
                return interaction.reply("Repository not found! Please check the username and repository name.");
            }

            repoConfig.set(interaction.channelId, { username: newUsername, lastCommit: null });
            saveConfig();

            await interaction.reply(`This channel is now tracking: **${newUsername}**`);
            console.log(`Updated repository path for channel ${interaction.channelId} to: ${newUsername}`);
        } catch (error) {
            console.error("Error checking repository:", error);
            await interaction.reply("Error validating the repository. Please try again.");
        }
    }
});

client.login(TOKEN);

