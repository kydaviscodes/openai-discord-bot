import { getAnswer } from "./api/openaiApi.js";

export async function openaiAnswer(message, client) {
    var question = message.content.replace(client.user.id, "").replace("<@> ", "").trim();
    getAnswer(question).then(result => {
        if (result && result.trim() !== '') {
            //message.channel.send(result);
            message.reply(result);
        }
    });
}
export async function generateLessonPlan(message, client) {
  const topic = message.content.replace("/lessonplan", "").trim();
  console.log("User input topic is: ", topic); //
    if (!topic) {
      message.reply("Please specify a topic. Usage: `/lessonplan [topic]`");
      return;
    }
    
    getLessonPlan(topic).then(result => {
      console.log("Generated lesson plan: ", result);
      if (result && result.trim() !== '') {
        message.reply(`Here's your lesson plan:\n${result}`);
      }
    });
  }