import { getAnswer, getLessonPlan } from "./api/openaiApi.js";
import PDFDocument from 'pdfkit';
import fs from 'fs/promises';  // Import promise-based fs
import { AttachmentBuilder } from 'discord.js';
import path from 'path'
import fs from 'fs';  // Import regular fs for createWriteStream

console.log("Current directory:", process.cwd());

export async function generatePDF(lessonPlan, topic, ageGroup) {
  const pdfFileName = `${topic}_${ageGroup}_LessonPlan.pdf`;
  const pdfPath = `./${pdfFileName}`;
  const pdfChunks = [];

  const doc = new PDFDocument();
  doc.on('data', chunk => {
    pdfChunks.push(chunk);
  });

  const writeStream = fs.createWriteStream(pdfFileName);
  doc.pipe(writeStream);

  for (const [key, value] of Object.entries(lessonPlan)) {
    doc.text(`\n${key}:\n`, { underline: true });
    doc.text(`${value}\n`);
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