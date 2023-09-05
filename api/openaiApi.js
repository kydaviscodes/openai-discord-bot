import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js"; // Import necessary classes
import OpenAI from 'openai'; // Import OpenAI

dotenv.config();

// Initialize the Discord.js client with the appropriate intents
const intents = new GatewayIntentBits([
  "GUILDS",
  "GUILD_MESSAGES",
  // Add other intents you need here
]);

const client = new Client({ intents });

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Replace with your API key
});

// Event listener when the bot is ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Event listener when the bot receives a message
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore messages from other bots

  if (message.content.startsWith("!ask")) {
    const question = message.content.slice(5); // Remove the "!ask" prefix
    const answer = await getAnswer(question);
    message.channel.send(answer);
  }

  // Add more command handlers or event listeners here

});

// Function to get an answer from OpenAI
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

// Login to Discord using the provided bot token
client.login(process.env.BOT_TOKEN);
