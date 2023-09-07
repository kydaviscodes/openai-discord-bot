import { getLessonPlan } from "./api/openaiApi.js";
import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import fsCore from 'fs';
import { AttachmentBuilder } from 'discord.js';

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

  // Parse and add content
  for (const [key, value] of Object.entries(lessonPlan)) {
    doc.fontSize(18).text(key, { underline: true }).fontSize(12).text(value);
    doc.moveDown();
  }

  doc.end();

  try {
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    const pdfBuffer = Buffer.from(pdfChunks);
    return { pdfFileName, pdfBuffer };
  } catch (error) {
    throw error;
  }
}

export async function generateAndSendLessonPlan(client, channelId, topic, ageGroup) {
  try {
    const lessonPlanText = await getLessonPlan(topic, ageGroup);
    const lessonPlan = parseLessonPlan(lessonPlanText);
    const { pdfFileName, pdfBuffer } = await generatePDF(lessonPlan, topic, ageGroup);
    await sendPDF(client, channelId, pdfFileName, pdfBuffer);
  } catch (error) {
    console.error('Error in generateAndSendLessonPlan:', error);
  }
}

function parseLessonPlan(planText) {
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

async function sendPDF(client, channelId, pdfFileName, pdfBuffer) {
  try {
    const attachment = new AttachmentBuilder()
      .setName(pdfFileName)
      .setFile(pdfBuffer);

    await client.channels.cache.get(channelId).send({ files: [attachment] });
  } catch (error) {
    console.error('Error sending PDF:', error);
    throw error;
  }
}
