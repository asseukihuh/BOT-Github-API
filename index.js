//IMPORT DISCORD JS
import { Client, GatewayIntentBits } from 'discord.js';

function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

const fetchCommit = async () => {
    const response = await fetch("https://api.github.com/repos/asseukihuh/ai-webapp/commits");
    const commits = await response.json();
    return commits[0];
};

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!commit')) {
        const commits = await fetchCommit();
        message.reply(`Commited at: ${formatTimestamp(commits.commit.author.date)}\nBy: ${commits.author.login}\nMessage: ${commits.commit.message}\nSee it here: ${commits.html_url}`);
    }
});

client.login('');
