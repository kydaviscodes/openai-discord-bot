import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js"; // Correct import
import OpenAI from 'openai';

dotenv.config();

const intents = new GatewayIntentBits([
  "GUILDS",
  "GUILD_MESSAGES",
  // Add other intents you need here
]);

const client = new Client({ intents });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("!ask")) {
    const question = message.content.slice(5);
    const answer = await getAnswer(question);
    message.channel.send(answer);
  }

  // Add more command handlers or event listeners here
});

async function getAnswer(question) {
  try {
    const chatResponse = await openai.chat.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question }
      ],
    });

    if (chatResponse.status !== 200) {
      return "Sorry, I don't understand that.";
    }

    return chatResponse.data.choices[0]?.message?.content || "No answer available.";
  } catch (error) {
    console.error("Error in getAnswer:", error);
    return "Sorry, I can't answer that question. \n" + error;
  }
}

client.login(process.env.BOT_TOKEN);
