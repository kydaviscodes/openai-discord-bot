import { getAnswer, getLessonPlan } from "./api/openaiApi.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';

console.log("Current directory:", process.cwd());

// Modified generatePDF function to accept topic and ageGroup
function generatePDF(lessonPlan, topic, ageGroup) {
  return new Promise((resolve, reject) => {
    const pdfFileName = `${topic}_${ageGroup}_LessonPlan.pdf`;

    // Create a new PDF document
    const doc = new PDFDocument();

    // Pipe its output to a writable stream (in this case, a file)
    const writeStream = fs.createWriteStream(pdfFileName);

    doc.pipe(writeStream);

    // Add the lesson plan to the PDF
    doc.text("Here's your lesson plan:\n", { underline: true });

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

    getLessonPlan(topic, ageGroup).then(async (result) => {
      console.log("Generated lesson plan: ", result);

      const lessonPlanJSON = convertToJSON(result);
      try {
        const pdfFileName = await generatePDF(lessonPlanJSON, topic, ageGroup); // Wait for the PDF to be generated

        // Debugging Step 1: Check if pdfFileName is Correct
        console.log("Generated PDF File Name:", pdfFileName);

        // Debugging Step 3: Check File Path
        if (fs.existsSync(`./${pdfFileName}`)) {
          console.log("File exists, attempting to send.");

          // Use AttachmentBuilder instead of MessageAttachment
          const attachment = new AttachmentBuilder(`./${pdfFileName}`, { contentType: 'application/pdf', name: pdfFileName });

          message.reply(`Here's your lesson plan for ${topic} and ${ageGroup}:`, {
            files: [attachment]
          })
          // Debugging Step 2: Check the Promise
          .then(() => {
            console.log('Attempted to send message with PDF');
          })
          .catch(error => {
            console.error('Error while sending PDF:', JSON.stringify(error, null, 2));  // This should catch any errors
          });
        } else {
          console.log("File does not exist, cannot send.");
        }

      } catch (error) {
        console.error('Error while generating PDF:', error);
      }

    }).catch(error => {
      console.error('Error in generateLessonPlan getLessonPlan:', error);
    });

  } catch (error) {
    console.error('Error in generateLessonPlan:', error);
  }
}





