//IMPORT DISCORD JS
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

function calculate(expression) {
    try {
        return eval(expression);
    } catch (error) {
        return "Invalid expression!";
    }
}

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content.startsWith('!calculate')) {
        const expression = message.content.slice(11).trim();
        
        if (expression) {
            const result = calculate(expression);
            message.reply(`Result: ${result}`);
        } else {
            message.reply("Please provide a mathematical expression.");
        }
    }
});

client.login('');
