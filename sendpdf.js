import dotenv from "dotenv";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js'; 

dotenv.config();
console.log("Node.js version:", process.version);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('guildCreate', guild => {
  console.log(`Joined a new guild: ${guild.name}`);
});

client.on('messageCreate', async (message) => {
  console.log(`Received message: ${message.content}`);
  if (message.content === '!sendpdf') {
    try {
      const doc = new PDFDocument();
      const pdfPath = './test.pdf';
      const stream = fs.createWriteStream(pdfPath);

      doc.text('Hello, this is a test PDF document.');
      doc.pipe(stream);
      doc.end();

      stream.on('finish', async () => {
        const attachment = new AttachmentBuilder(fs.readFileSync(pdfPath), { name: 'test.pdf' });  // Use AttachmentBuilder here
        await message.reply({ content: 'Here is your PDF:', files: [attachment] });
      });
    } catch (error) {
      console.error('An error occurred:', error);
      message.reply('An error occurred while generating the PDF.');
    }
  }
});

client.on('error', (error) => {
  console.error(`An error occurred: ${error}`);
});


client.login(process.env.CLIENT_TOKEN);
