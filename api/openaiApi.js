import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();



const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function getAnswer(question) {
  try {
    const chatResponse = await openai.ChatCompletion.create({
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

export async function getLessonPlan(topic) {
  try {
    const chatResponse = await openai.ChatCompletion.create({
      model: "gpt-4",
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
