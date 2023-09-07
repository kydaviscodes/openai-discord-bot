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

export async function generatePDF(lessonPlan, topic, ageGroup) {
  const pdfFileName = `${topic}_${ageGroup}_LessonPlan.pdf`;
  const pdfPath = `./${pdfFileName}`;
  const pdfChunks = [];

  const doc = new PDFDocument();
  doc.on('data', chunk => {
    pdfChunks.push(chunk);
  });

  const writeStream = fsCore.createWriteStream(pdfFileName);
  doc.pipe(writeStream);

  // Add title
  doc.fontSize(24).text(`${topic} Lesson Plan for Age Group ${ageGroup}`, { align: 'center' }).fontSize(12);

  for (const [key, value] of Object.entries(lessonPlan)) {
    doc.addPage().fontSize(18).text(key, { underline: true }).fontSize(12).text(value);
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
  const sections = ["Objective", "Materials", "Introduction", "Activities", "Closure", "Extension Activities", "Assessments"];
  const lessonPlan = {};

  sections.forEach(section => {
    const regex = new RegExp(`\\*\\*${section}\\*\\*:\\s*([\\s\\S]*?)(?=\\*\\*|$)`);
    const match = planText.match(regex);
    if (match && match[1]) {
      lessonPlan[section] = match[1].trim();
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
