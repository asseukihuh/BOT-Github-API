// IMPORT DISCORD JS
import { Client, GatewayIntentBits } from 'discord.js';

function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toISOString().replace('T', ' ').split('.')[0];
}

let username = `asseukihuh/AI-WebApp`;

async function fetchCommit() {
    let url = `https://api.github.com/repos/${username}/commits`;
    
    console.log("Checking commits");
    
    try {
        const response = await fetch(url,{
            headers: {
                "Authorization": "Bearer TOKEN",
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

async function CheckCommits() {
    const latestCommit = await fetchCommit();
    if (!latestCommit) return;

    if (last_commit !== latestCommit.sha) {
        last_commit = latestCommit.sha;

        const channel = client.channels.cache.find(ch => ch.isTextBased());
        if (channel) {
            channel.send(`**Commited at :** ${formatTimestamp(latestCommit.commit.author.date)}\n**By :** ${latestCommit.author.login}\n**Message :** ${latestCommit.commit.message}\n[**View Commit**](${latestCommit.html_url})`);
        }
    }
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log('Bot is online!');
    CheckCommits();
    setInterval(CheckCommits, 60000);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.startsWith('!config_commit')) {
        username = message.content.slice(15).trim();
        username = username.replace(' ','/');
        message.reply(username);
    }
});

let last_commit = null;

client.login('YOUR_DISCORD_BOT_TOKEN');

