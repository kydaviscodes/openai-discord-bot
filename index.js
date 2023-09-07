import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { openaiAnswer, generateAndSendLessonPlan } from "./helpers.js";
import { registerCommands } from './registerCommands.js';

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
    registerCommands(client);
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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
  
    const { commandName } = interaction;
  
    if (commandName === 'lessonplan') {
      try {
        await interaction.deferReply();  // Immediate reply to acknowledge the command
  
        const topic = interaction.options.getString('topic');
        const ageGroup = interaction.options.getString('agegroup');
  
        // Generate and send the lesson plan
        await generateAndSendLessonPlan(client, interaction.channel.id, topic, ageGroup);
  
        await interaction.editReply(`Lesson plan for ${topic} and age group ${ageGroup} has been generated.`);
      } catch (error) {
        console.error(error);
        await interaction.followUp('An error occurred while generating the lesson plan.');
      }
    }
  });
  
console.log("Node.js version:", process.version);

client.login(process.env.CLIENT_TOKEN);
