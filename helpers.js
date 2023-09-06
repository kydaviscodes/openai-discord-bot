import { getAnswer, getLessonPlan } from "./api/openaiApi.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { AttachmentBuilder } from 'discord.js';  // Import AttachmentBuilder here

console.log("Current directory:", process.cwd());

// Modified generatePDF function to accept topic and ageGroup
function generatePDF(lessonPlan, topic, ageGroup) {
  return new Promise((resolve, reject) => {
    const pdfFileName = `${topic}_${ageGroup}_LessonPlan.pdf`;

    // Create a new PDF document
    const doc = new PDFDocument();
    const pdfPath = `./${pdfFileName}`
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
      // Check the PDF file size
    fs.stat(pdfFileName, (err, stats) => {
    if (err) {
      console.error('Error getting file stats:', err);
    } else {
      console.log("Generated PDF File Size in Bytes:", stats["size"]);
    }
  });

  resolve(pdfFileName);  // Return the name of the generated PDF
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
      const pdfPath = `./${pdfFileName}`;
      
      try {
        const pdfFileName = await generatePDF(lessonPlanJSON, topic, ageGroup); // Wait for the PDF to be generated
        const pdfPath = `./${pdfFileName}`;

        if (fs.existsSync(pdfPath)) {
          console.log("File exists, attempting to send.");
        
          try {
            const buffer = fs.readFileSync(pdfPath);
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
      } catch (err) {
        console.error("Error creating AttachmentBuilder or sending message:", err);
          }
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