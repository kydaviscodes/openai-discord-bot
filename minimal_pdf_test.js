const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (message.content === '!sendpdf') {
    try {
      await message.reply({
        content: 'Sending PDF...',
        files: [{
          attachment: './knownfile.pdf',
          name: 'knownfile.pdf'
        }]
      });
      console.log('PDF sent.');
    } catch (error) {
      console.error('Error sending PDF:', error);
    }
  }
});

client.login('YOUR_BOT_TOKEN');
