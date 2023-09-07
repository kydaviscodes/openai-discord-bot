import Discord, { Client, GatewayIntentBits, AttachmentBuilder} from "discord.js";
import dotenv from "dotenv";
import { OpenAI } from './api/openaiApi.js';
import { openaiAnswer, generateLessonPlan } from "./helpers.js";
import fs from 'fs';
import PDFDocument from 'pdfkit';

dotenv.config();
console.log(Object.keys(OpenAI));
console.log('OpenAI object:', OpenAI);

const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ]
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("reconnecting", () => {
    console.log(`Reconnecting - ${client.user.tag}!`);
});

client.on("disconnect", () => {
    console.log(`Disconnect - ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  console.log(`Received message: ${message.content}`);
    try {
        if (message.author.bot) return;

        if (
            message.content.includes("@here") ||
            message.content.includes("@everyone") ||
            message.type === "REPLY"
        )
            return;

        if (message.content === "ping") {
            message.reply("pong");
            return;
        }

        if (message.content.startsWith("/")) {
            if (message.content.startsWith('/lessonplan')) {
                generateLessonPlan(message, client);  // Make sure to pass the message object here
              }
        }
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
        

        if (
            message.mentions.has(client.user.id) ||
            message.content.toString().includes(process.env.ROBOT_USER_ID)
        ) {
            openaiAnswer(message, client);
        }
    } catch (error) {
        console.error("Error in message event:", error);
    }
});

console.log("Node.js version:", process.version);

client.login(process.env.CLIENT_TOKEN);
