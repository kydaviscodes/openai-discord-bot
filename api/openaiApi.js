import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function getAnswer(question) {
  try {
    const chatResponse = await openai.createChatCompletion("gpt-4", {
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

export async function getLessonPlan(topic) {
  try {
    const chatResponse = await openai.createChatCompletion("gpt-4", {
      messages: [
        { role: "system", content: "You are a helpful assistant specialized in creating lesson plans." },
        { role: "user", content: `Create a preschool lesson plan about ${topic}.` }
      ],
    });

    if (chatResponse.status !== 200) {
      return "Sorry, I can't generate that lesson plan.";
    }

    return chatResponse.data.choices[0]?.message?.content || "No lesson plan available.";
  } catch (error) {
    console.error("Error in getLessonPlan:", error);
    return "Sorry, an error occurred while generating the lesson plan.";
  }
}
