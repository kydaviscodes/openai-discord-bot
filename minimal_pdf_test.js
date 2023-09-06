import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    console.log(`Received message: ${message.content}`);
    if (message.content === '!sendpdf') {
    await message.reply('Testing...');
      console.log('!sendpdf command received. Attempting to send PDF...');
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
        console.log('Caught an error while sending PDF.');
        console.error(error);
      }
    }
  });

client.login('MTE0Nzk2NTQ1OTAyNzczNDYzOQ.GO7IC7.OGC03VZWT52uGovw2CWYjVVYcfhEr73QPJ1SDI');
