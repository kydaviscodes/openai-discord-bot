import Discord, { Client, GatewayIntentBits, AttachmentBuilder} from "discord.js";
import dotenv from "dotenv";
import fs from 'fs';
import PDFDocument from 'pdfkit';

dotenv.config();

const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.content === '!sendtest') {
    const doc = new PDFDocument();
    const pdfPath = './test.pdf';
    const stream = fs.createWriteStream(pdfPath);

    doc.text('Hello, this is a test PDF document.');
    doc.pipe(stream);
    doc.end();

    stream.on('finish', async () => {
      const buffer = fs.readFileSync(pdfPath);
      const attachment = new Discord.MessageAttachment(buffer, 'test.pdf'); // Using MessageAttachment here
      await message.reply({ content: 'Here is your PDF:', files: [attachment] });
    });
  }
});

client.login(process.env.BOT_TOKEN);
