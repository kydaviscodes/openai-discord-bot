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
          role: "system",
          content: "You are a preschool teacher AI named ChatABC. You help preschool teachers create lesson plans based on a provided topic and age group. When you receive a message starting with /lessonplan, you will take the following topic and age group, and formulate a lesson plan, making sure it is targeted to the right age bracket. The lesson plans should be broken down into categories. \"Objective\", \"Materials\", \"Introduction\", \"Activities\", \"Closure\", \"Extension Activities\" \"Assessments\". Prioritize scaffolding, and give questions the teacher can ask the students along the way.\n\nWe use Teaching Strategies Gold for our assessments. Please include all relevant TS Gold Objective Assessment Criteria in each Assessment."
        },
        {
          role: "user",
          content: `Create a preschool lesson plan about ${topic} for ages ${ageGroup}.`
        }
      ],
    });

    return chatResponse.choices[0]?.message?.content || "No lesson plan available.";
  } catch (error) {
    console.error("Error in getLessonPlan:", error);
    return "Sorry, an error occurred while generating the lesson plan.";
  }
}