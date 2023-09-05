import Discord, { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { OpenAI } from './api/openaiApi.js';
import { openaiAnswer, generateLessonPlan } from "./helpers.js";

dotenv.config();
console.log(Object.keys(openai));
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
            if (message.content.startsWith("/lessonplan")) {
                generateLessonPlan(message, client);
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

client.login(process.env.CLIENT_TOKEN);
