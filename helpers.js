import { getAnswer, getLessonPlan } from "./api/openaiApi.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { AttachmentBuilder } from 'discord.js';  // Import AttachmentBuilder here

console.log("Current directory:", process.cwd());

function generatePDF(lessonPlan, topic, ageGroup) {
  return new Promise((resolve, reject) => {
    const pdfFileName = `${topic}_${ageGroup}_LessonPlan.pdf`;
    const pdfPath = `./${pdfFileName}`;
    const pdfChunks = [];

    // Create a new PDF document
    const doc = new PDFDocument();
    doc.on('data', chunk => {
      pdfChunks.push(chunk);
    });

    // Pipe its output to a writable stream (in this case, a file)
    const writeStream = fs.createWriteStream(pdfFileName);
    doc.pipe(writeStream);

    // Add the lesson plan to the PDF
    for (const [key, value] of Object.entries(lessonPlan)) {
      doc.text(`\n${key}:\n`, { underline: true });
      doc.text(`${value}\n`);
    }

    // Finalize the PDF and end the stream
    doc.end();

    writeStream.on('finish', () => {
      const pdfBuffer = Buffer.from(pdfChunks);
      resolve({ pdfFileName, pdfBuffer });
    });

    writeStream.on('error', (err) => {
      reject(err);
    });
  });
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

export async function generateLessonPlan(message) {
  try {
    // Show a loading message
    const loadingMessage = await message.reply('Generating your lesson plan, please wait...');

    const userInput = message.content.replace("/lessonplan", "").trim().split(" ");
    const topic = userInput[0];
    const ageGroup = userInput.slice(1).join(" ");
    
    if (!topic || !ageGroup) {
      message.reply("Please specify a topic and an age group. Usage: `/lessonplan [topic] [age group]`");
      return;
    }

    getLessonPlan(topic, ageGroup).then(async (result) => {
      const lessonPlanJSON = convertToJSON(result);
      const pdfFileName = `${topic}_${ageGroup}_LessonPlan.pdf`;
      const pdfPath = `./${pdfFileName}`;  // Define pdfPath here
      
      try {
        const pdfFileName = await generatePDF(lessonPlanJSON, topic, ageGroup); // Wait for the PDF to be generated

        if (fs.existsSync(pdfPath)) {
          console.log("File exists, attempting to send.");
        
          const buffer = fs.readFileSync(pdfPath);  // Read the file into a buffer
          const attachment = new AttachmentBuilder(buffer, { name: pdfFileName, contentType: 'application/pdf' });
          
          await message.reply(`Here's your lesson plan on ${topic} for ages ${ageGroup}:`, {
            files: [attachment]
          })
          .then(() => {
            console.log("Message with PDF sent successfully.");
          })
          .catch(err => {
            console.error("Error sending message with PDF:", err);
          });

          // Delete the loading message
          loadingMessage.delete();
        } else {
          console.log("File does not exist, cannot send.");
        }

      } catch (error) {
        console.error('Error in generateLessonPlan:', error);
      }

    }).catch(error => {
      console.error('Error in generateLessonPlan getLessonPlan:', error);
    });

  } catch (error) {
    console.error('Error in generateLessonPlan:', error);
  }
}
