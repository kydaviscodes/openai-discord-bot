import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

console.log("OpenAI initialized object:", openai);
console.log("Is OPENAI_API_KEY defined?", Boolean(process.env.OPENAI_API_KEY));
console.log("Is chat.completions.create available?", Boolean(openai.chat && openai.chat.completions.create));

export async function getAnswer(question) {
  console.log("Question received:", question);
  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question }
      ],
    });

    return chatResponse.choices[0]?.message?.content || "No answer available.";
  } catch (error) {
    console.error("Error in getAnswer:", error);
    return "Sorry, I can't answer that question. \n" + error;
  }
}

export async function getLessonPlan(topic, ageGroup) {
  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          "role": "system",
          "content": "You are a preschool teacher AI named ChatABC..."
        },
        { "role": "user", "content": "/lessonplan " + topic },
        { "role": "assistant", "content": `Sure! What is the age group for this lesson plan?` },
        { "role": "user", "content": ageGroup }
      ],
      temperature: 1,
      max_tokens: 1500,
      top_p: 1,
      stream: true,
    });

    return chatResponse.choices[0]?.message?.content || "No lesson plan available.";
  } catch (error) {
    console.error("Error in getLessonPlan:", error);
    return "Sorry, an error occurred while generating the lesson plan.";
  }
}

export { openai as OpenAI };
