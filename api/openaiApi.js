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

function splitLessonPlan(lessonPlan) {
  const sections = ["Objective", "Materials", "Introduction", "Activities", "Closure", "Extension Activities"];
  let result = {};
  let remainingText = lessonPlan;

  sections.forEach((section) => {
    let startIdx = remainingText.indexOf(section);
    if (startIdx === -1) {
      result[section] = "Not provided";
      return;
    }

    // Find the start index of the next section
    let nextStartIdx = remainingText.length;
    sections.forEach((nextSection) => {
      let tempIdx = remainingText.indexOf(nextSection, startIdx + section.length);
      if (tempIdx !== -1 && tempIdx < nextStartIdx) {
        nextStartIdx = tempIdx;
      }
    });

    // Extract content for the current section
    let content = remainingText.slice(startIdx + section.length, nextStartIdx).trim();
    result[section] = content;

    // Update remainingText
    remainingText = remainingText.slice(nextStartIdx);
  });

  return result;
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
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    });

    const fullLessonPlan = chatResponse.choices[0]?.message?.content || "No lesson plan available.";
    const parsedLessonPlan = splitLessonPlan(fullLessonPlan);
    return parsedLessonPlan;

  } catch (error) {
    console.error("Error in getLessonPlan:", error);
    return "Sorry, an error occurred while generating the lesson plan.";
  }
}


export { openai as OpenAI };
