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
        {
          "role": "user",
          "content": "Hello!"
        },
        {
          "role": "assistant",
          "content": "Hello! How can I assist you today?"
        },
        {
          "role": "user",
          "content": "/lessonplan dinosaurs"
        },
        {
          "role": "assistant",
          "content": "Sure! What is the age group for this lesson plan?"
        },
        {
          "role": "user",
          "content": "3-5 year olds"
        },
        {
          "role": "assistant",
          "content": "Great! Here's a lesson plan on dinosaurs for 3-5 year olds:\n\nObjective:\n- Introduce and familiarize children with the concept of dinosaurs.\n- Develop vocabulary related to dinosaurs.\n- Encourage curiosity and critical thinking about prehistoric creatures.\n\nMaterials:\n- Pictures or models of dinosaurs\n- Books about dinosaurs\n- Dinosaur toys or figurines\n- Coloring materials (crayons, markers, etc.)\n- Craft supplies (construction paper, glue, scissors, etc.)\n\nIntroduction:\n1. Gather the children in a circle and display pictures or models of different dinosaurs.\n2. Start a discussion by asking questions like:\n   - \"Have you heard of dinosaurs before?\"\n   - \"What do you think dinosaurs look like?\"\n   - \"Can you name any dinosaurs?\"\n   - \"Do you know where dinosaurs lived?\"\n\nActivities:\n1. Dinosaur Exploration:\n   - Set up a dinosaur discovery area with books, pictures, and dinosaur toys for the children to explore.\n   - Encourage them to ask questions and share their observations.\n   - Ask open-ended questions like:\n     - \"What do you notice about these dinosaurs?\"\n     - \"How do you think dinosaurs moved?\"\n     - \"What do you think they ate?\"\n\n2. Dinosaur Crafts:\n  "
        }
      ],
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
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
