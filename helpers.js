import { getAnswer, getLessonPlan } from "./api/openaiApi.js";

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

export async function generateLessonPlan(message, client) {
  try {
    const topic = message.content.replace("/lessonplan", "").trim();
    console.log("User input topic is: ", topic);
    
    if (!topic) {
      message.reply("Please specify a topic. Usage: `/lessonplan [topic]`");
      return;
    }
    
    getLessonPlan(topic).then(result => {
      console.log("Generated lesson plan: ", result);
      if (result && result.trim() !== '') {
        if (result.length > 2000) {
          result = result.substring(0, 1997) + "...";
        }
        message.reply(`Here's your lesson plan:\n${result}`);
      }
    }).catch(error => {
      console.error('Error in generateLessonPlan getLessonPlan:', error);
    });
  } catch (error) {
    console.error('Error in generateLessonPlan:', error);
  }
}