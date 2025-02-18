//IMPORT DISCORD JS
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

let commit = await fetch("https://api.github.com/repos/asseukihuh/ai-webapp/commits");
let message = commit[0]

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.startsWith('!commit')) {
        message.reply(message);
    }
});

client.login('');
