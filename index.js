import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { openaiAnswer, generateAndSendLessonPlan } from "./helpers.js";

dotenv.config();

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ]
});

client.once("ready", () => {
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
                const args = message.content.split(' ').slice(1);  // Extract command arguments
                const topic = args[0];
                const ageGroup = args[1];
                await generateAndSendLessonPlan(client, message.channel.id, topic, ageGroup);
            }
        }

        if (
            message.mentions.has(client.user.id) ||
            message.content.toString().includes(process.env.ROBOT_USER_ID)
        ) {
            await openaiAnswer(message, client);
        }
    } catch (error) {
        console.error("Error in message event:", error);
    }
});

console.log("Node.js version:", process.version);

client.login(process.env.CLIENT_TOKEN);
