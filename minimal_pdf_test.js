import { Client, GatewayIntentBits, MessageEmbed } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (message.content === '!sendpdf') {
    try {
      const embed = new MessageEmbed()
        .setTitle('Your PDF File')
        .setDescription('Here is the PDF file you requested.')
        .setColor('#0099ff');

      await message.reply({
        embeds: [embed],
        files: [{
          attachment: './knownfile.pdf',
          name: 'knownfile.pdf'
        }]
      });

      console.log('PDF sent in an embed.');
    } catch (error) {
      console.error('Error sending PDF in an embed:', error);
    }
  }
});


client.login('MTE0Nzk2NTQ1OTAyNzczNDYzOQ.GO7IC7.OGC03VZWT52uGovw2CWYjVVYcfhEr73QPJ1SDI');
