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

async function CheckCommits(prev){
    const url = "https://api.github.com/repos/asseukihuh/ai-webapp/commits";
    const fetchCommit = async () => {
        const response = await fetch(url);
        const commits = await response.json();
        let current_commit = commits[0];
    };
    if()
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
});

let last_commit = null;

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!commit')) {
        const commits = await fetchCommit();
        message.reply(`Commited at: ${formatTimestamp(commits.commit.author.date)}\nBy: ${commits.author.login}\nMessage: ${commits.commit.message}\nSee it here: ${commits.html_url}`);
    }
});

setInterval(CheckCommits, 60000);

client.login('');
