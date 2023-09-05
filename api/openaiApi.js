import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function getAnswer(question) {
  try {
    const completion = await openai.createCompletion("gpt-3.5-turbo-0301", {
      prompt: question,
      temperature: 0.6,
      max_tokens: 600,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
      best_of: 1,
    });

    if (completion.status !== 200) {
      return "Sorry, I don't understand that.";
    }

    return completion.data.choices.map((choice) => choice.text).join("");
  } catch (error) {
    console.error("Error in getAnswer:", error);
    return "Sorry, I can't answer that question. \n" + error;
  }
}

export async function getLessonPlan(topic) {
  try {
    const completion = await openai.createCompletion("gpt-3.5-turbo-0301", {
      prompt: `Create a preschool lesson plan about ${topic}.`,
      temperature: 0.6,
      max_tokens: 600,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
      best_of: 1,
    });

    if (completion.status !== 200) {
      return "Sorry, I can't generate that lesson plan.";
    }

    return completion.data.choices.map((choice) => choice.text).join("");
  } catch (error) {
    console.error("Error in getLessonPlan:", error);
    return "Sorry, an error occurred while generating the lesson plan.";
  }
}
