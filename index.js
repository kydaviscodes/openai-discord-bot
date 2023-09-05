import Discord from "discord.js";
import dotenv from "dotenv";
import { openaiAnswer, generateLessonPlan } from "./helpers.js";


dotenv.config();
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
});

client.on("reconnecting", () => {
  console.log(`Reconnecting - ${client.user.tag}!`)
});

client.on("disconnect", () => {
  console.log(`Disconnect - ${client.user.tag}!`)
});

client.on("message", async message => {
  try {
  if (message.author.bot) return;

  if (message.content.includes("@here") || message.content.includes("@everyone") || message.type == "REPLY") return;

  if (message.content === "ping") {
    message.reply("pong");
    return;
  }
  if (message.content.startsWith("/")) {
    if (message.content.startsWith("/lessonplan")) {
      generateLessonPlan(message, client);
    }
  }
  if (message.mentions.has(client.user.id) || message.content.toString().includes(process.env.ROBOT_USER_ID)) {
    openaiAnswer(message, client);
  }
  } catch (error) {
    console.error('Error in message event:', error);
  }
});

client.login(process.env.CLIENT_TOKEN);