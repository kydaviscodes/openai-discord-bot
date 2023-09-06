import { getAnswer, getLessonPlan } from "./api/openaiApi.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';

function generatePDF(lessonPlan) {
  // Create a new PDF document
  const doc = new PDFDocument();

  // Pipe its output to a writable stream (in this case, a file)
  doc.pipe(fs.createWriteStream('LessonPlan.pdf'));

  // Add the lesson plan to the PDF
  doc.text("Here's your lesson plan:\n", { underline: true });

  for (const [key, value] of Object.entries(lessonPlan)) {
    doc.text(`\n${key}:\n`, { underline: true });
    doc.text(`${value}\n`);
  }

  // Finalize the PDF and end the stream
  doc.end();
}

export async function openaiAnswer(message, client) {
  try {
    var question = message.content.replace(client.user.id, "").replace("<@> ", "").trim();
    getAnswer(question).then(result => {
        if (result && result.trim() !== '') {
            message.reply(result);
        }
    }).catch(error => {
        console.error('Error in openaiAnswer getAnswer:', error);
    });
  } catch (error) {
    console.error('Error in openaiAnswer:', error);
  }
}

function convertToJSON(planText) {
  const lines = planText.split("\n\n");
  const lessonPlan = {};

  lines.forEach(line => {
    const parts = line.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(":").trim();
      lessonPlan[key] = value;
    }
  });

  return lessonPlan;
}

export async function generateLessonPlan(message, client) {
  try {
    const userInput = message.content.replace("/lessonplan", "").trim().split(" ");
    const topic = userInput[0];
    const ageGroup = userInput.slice(1).join(" ");
    console.log("User input topic is: ", topic);
    console.log("User input age group is: ", ageGroup);

    if (!topic || !ageGroup) {
      message.reply("Please specify a topic and an age group. Usage: `/lessonplan [topic] [age group]`");
      return;
    }

    getLessonPlan(topic, ageGroup).then(result => {
      console.log("Generated lesson plan: ", result);

      const lessonPlanJSON = convertToJSON(result);

      generatePDF(lessonPlanJSON);      
      message.reply("Here's your lesson plan:", { files: ['./LessonPlan.pdf'] });

  }).catch(error => {
    console.error('Error in generateLessonPlan getLessonPlan:', error);
  });
  } catch (error) {
    console.error('Error in generateLessonPlan:', error);
  }
}