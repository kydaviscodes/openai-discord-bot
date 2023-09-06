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
      if (result) {
        let replyMessage = "Here's your lesson plan:\n";
        for (const [key, value] of Object.entries(result)) {
          replyMessage += `\n**${key}**:\n${value}\n`;
        }
        
        if (replyMessage.length > 2000) {
          replyMessage = replyMessage.substring(0, 1997) + "...";
        }
        
        message.reply(replyMessage);
      }
    }).catch(error => {
      console.error('Error in generateLessonPlan getLessonPlan:', error);
    });
  } catch (error) {
    console.error('Error in generateLessonPlan:', error);
  }
}