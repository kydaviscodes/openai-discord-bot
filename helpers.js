import { getAnswer, getLessonPlan } from "./api/openaiApi.js";
import PDFDocument from 'pdfkit';
import fs from 'fs/promises';  // Import promise-based fs
import fsCore from 'fs';  // Import core fs for createWriteStream
import { AttachmentBuilder } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

export async function generatePDF(lessonPlan, topic, ageGroup) {
  const pdfFileName = `${toTitleCase(topic)}_${ageGroup}_LessonPlan.pdf`;
  const pdfPath = `./${pdfFileName}`;
  const pdfChunks = [];

  const doc = new PDFDocument();
  doc.on('data', chunk => {
    pdfChunks.push(chunk);
  });

  const writeStream = fsCore.createWriteStream(pdfFileName);
  doc.pipe(writeStream);
  doc.fontSize(18).text(`Lesson Plan: ${toTitleCase(topic)}`, { align: 'center', underline: true }).fontSize(12).moveDown();

  for (const [key, value] of Object.entries(lessonPlan)) {
    if (key === 'Activities') {
      doc.text(`\n${key}:\n`, { underline: true });
      // Parse and handle activities separately
      const activities = value.split('\n');
      activities.forEach((activity) => {
        // Check if the line starts with a number followed by a period
        if (/^\d+\./.test(activity.trim())) {
          doc.text(`${activity}\n`, { underline: true });
        } else {
          doc.text(`${activity}\n`);
        }
      });
    } else {
      doc.text(`\n${key}:\n`, { underline: true });
      doc.text(`${value}\n`);
    }
  }

  doc.end();

  try {
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    const pdfBuffer = Buffer.from(pdfChunks);
    console.log('File has been written');
    return { pdfFileName, pdfBuffer };
  } catch (error) {
    console.log('An error occurred:', error);
    throw error;
  }
}

export async function openaiAnswer(message, client) {
  try {
    const question = message.content.replace(client.user.id, "").replace("<@> ", "").trim();
    const result = await getAnswer(question);
    if (result && result.trim() !== '') {
      message.reply(result);
    }
  } catch (error) {
    console.error('Error in openaiAnswer:', error);
  }
}

export async function convertToJSON(planText) {
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

export async function sendPDF(client, channelId, pdfFileName) {
  try {
    const pdfPath = path.join(__dirname, pdfFileName);

    // Check if file exists
    await fs.access(pdfPath);

    // Read the file into a buffer
    const buffer = await fs.readFile(pdfPath);

    // Create an attachment using AttachmentBuilder
    const attachment = new AttachmentBuilder()
      .setName(pdfFileName)
      .setFile(buffer);

    // Send the PDF
    await client.channels.cache.get(channelId).send({ files: [attachment] });

    console.log('Message with PDF sent successfully.');
  } catch (error) {
    console.error('Error sending PDF:', error);
    throw error;
  }
}

export async function generateAndSendLessonPlan(client, channelId, topic, ageGroup) {
  try {
    // Fetch the lesson plan from OpenAI
    const lessonPlanText = await getLessonPlan(topic, ageGroup);
    console.log("Lesson Plan Text:", lessonPlanText);  // Debugging line
    const lessonPlanJSON = await convertToJSON(lessonPlanText);  // Added await here

    // Generate the PDF
    const { pdfFileName, pdfBuffer } = await generatePDF(lessonPlanJSON, topic, ageGroup);

    // Send the PDF
    await sendPDF(client, channelId, pdfFileName, pdfBuffer);
  } catch (error) {
    console.error('Error in generateAndSendLessonPlan:', error);
  }
}
