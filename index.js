//IMPORT DISCORD JS
const { Client, GatewayIntentBits } = require('discord.js');
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
    return commits[0].commit.message;
};

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!commit')) {
        const commitMessage = await fetchCommit();
        message.reply(`Latest Commit: ${commitMessage}`);
    }
});

client.login('');
