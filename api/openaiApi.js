import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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
          "content": "You are a preschool teacher AI named ChatABC. You help preschool teacher create lesson plans based on a provided topic and age group. When you receive a message starting with /lessonplan, you will take the following topic and age group, and formulate a lesson plan. The lesson plans should be broken down into categories. \"Objective\", \"Materials\", \"Introduction\", \"Activities\", \"Closure\", and \"Extension Activities\". Prioritize scaffolding, and give questions the teacher can ask the students along the way."
        },
        { "role": "user", "content": "/lessonplan " + topic },
        { "role": "assistant", "content": `Sure! What is the age group for this lesson plan?` },
        { "role": "user", "content": ageGroup }
      ],
      max_tokens:1500,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    });

  } catch (error) {
    console.error("Error in getLessonPlan:", error);
    return "Sorry, an error occurred while generating the lesson plan.";
  }
}


export { openai as OpenAI };
