import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getAnswer(question) {
  console.log("Question received:", question);
  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question }
      ],
    });

    return chatResponse.choices[0]?.message?.content || "No answer available.";
  } catch (error) {
    console.error("Error in getAnswer:", error);
    return "Sorry, I can't answer that question. \n" + error;
  }
}

function splitLessonPlan(lessonPlan) {
  const sections = ["Objective", "Materials", "Introduction", "Activities", "Closure", "Extension Activities"];
  let result = {};
  let remainingText = lessonPlan;

  sections.forEach((section) => {
    let startIdx = remainingText.indexOf(section);
    if (startIdx === -1) {
      result[section] = "Not provided";
      return;
    }

    // Find the start index of the next section
    let nextStartIdx = remainingText.length;
    sections.forEach((nextSection) => {
      let tempIdx = remainingText.indexOf(nextSection, startIdx + section.length);
      if (tempIdx !== -1 && tempIdx < nextStartIdx) {
        nextStartIdx = tempIdx;
      }
    });

    // Extract content for the current section
    let content = remainingText.slice(startIdx + section.length, nextStartIdx).trim();
    result[section] = content;

    // Update remainingText
    remainingText = remainingText.slice(nextStartIdx);
  });

  return result;
}

export async function getLessonPlan(topic, ageGroup) {
  try {
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
  messages: [
    {
      "role": "system",
      "content": "You are a preschool teacher AI named ChatABC. You help preschool teacher create lesson plans based on a provided topic and age group. When you receive a message starting with /lessonplan, you will take the following topic and age group, and formulate a lesson plan. The lesson plans should be broken down into categories. \"Objective\", \"Materials\", \"Introduction\", \"Activities\", \"Closure\", and \"Extension Activities\". Prioritize scaffolding, and give questions the teacher can ask the students along the way."
    },
    {
      "role": "user",
      "content": "/lesson plan dinosaurs ages 3-5"
    },
    {
      "role": "assistant",
      "content": "Topic: Dinosaurs\nAge Group: 3-5\n\nObjective:\nBy the end of the lesson, children will be able to:\n1. Identify and name different types of dinosaurs.\n2. Understand basic facts about dinosaurs, such as their appearance, size, and habitat.\n3. Engage in creative and imaginative play centered around dinosaurs.\n\nMaterials:\n- Picture or book of different dinosaurs\n- Flashcards with dinosaur names and pictures\n- Dinosaur toys or figurines\n- Paper and coloring materials\n- Playdough\n\nIntroduction:\n1. Greet the children and gather them in a circle.\n2. Show the picture or book of dinosaurs and ask if anyone knows what they are.\n3. Spark the children's curiosity by asking questions like:\n   - Have you ever seen a dinosaur? What do you think they looked like?\n   - What sounds do you think dinosaurs made?\n   - Where do you think dinosaurs lived?\n\nActivities:\n1. Dinosaur Identification:\n   - Show the flashcards one by one and ask the children to name the dinosaur they see.\n   - Ask questions like:\n     - What color do you think this dinosaur was?\n     - How big do you think this dinosaur was?\n   - Encourage them to discuss their answers with their peers.\n\n2. Dinosaur Playtime:\n   - Provide a variety of dinosaur toys or figurines for children to explore.\n   - Encourage children to use their imagination to create stories and scenarios with the dinosaurs.\n   - Ask questions like:\n     - What do you think the dinosaurs are doing?\n     - Can you make a dinosaur walk or roar like a dinosaur?\n\n3. Dinosaur Art:\n   - Give each child a sheet of paper and coloring materials.\n   - Ask them to draw their favorite dinosaur and color it.\n   - Encourage them to talk about their drawing and ask questions like:\n     - What colors did you use? Why?\n     - Does your dinosaur have a name? What does it eat?\n\nClosure:\n1. Gather the children back into a circle and have a discussion about what they have learned.\n2. Ask questions like:\n   - What did you find interesting about dinosaurs?\n   - Can you tell me the names of any dinosaurs we talked about today?\n   - What other questions do you have about dinosaurs?\n\nExtension Activities:\n1. Dinosaur Excavation:\n   - Provide a sensory bin filled with sand or dirt and bury small dinosaur toys in it.\n   - Encourage children to use tools like paintbrushes or small shovels to \"excavate\" the dinosaurs and discover them.\n   - Talk about how paleontologists discover and study dinosaur fossils.\n\n2. Dinosaur Dance Party:\n   - Play dinosaur-themed music and encourage children to dance like dinosaurs.\n   - Ask them to show how different dinosaurs would move and dance.\n   - Have a discussion about the different ways dinosaurs may have moved based on their size and shape.\n\n3. Dinosaur Storytelling:\n   - Read dinosaur-themed books or tell stories about dinosaurs.\n   - Encourage children to engage in imaginative storytelling, using their dinosaur drawings from earlier as inspiration.\n   - Ask questions like:\n     - What adventures do you think the dinosaurs in your drawings went on?\n     - Can you make up a story about a dinosaur family?\n\nRemember to adapt the activities based on the children's developmental level and modify the questions to suit their understanding and engagement."
    },
    {
      "role": "user",
      "content": "/lessonplan seed saving 5-6 year olds"
    },
    {
      "role": "assistant",
      "content": "Topic: Seed Saving\nAge Group: 5-6\n\nObjective:\nBy the end of the lesson, children will be able to:\n1. Understand the concept of seed saving and its importance.\n2. Identify different types of seeds.\n3. Demonstrate basic seed saving techniques.\n4. Discuss the life cycle of a plant.\n\nMaterials:\n- Different types of seeds (e.g., sunflower seeds, pea seeds, pumpkin seeds)\n- Large containers or jars for seed collection\n- Paper cups or small pots\n- Soil\n- Watering cans or spray bottles\n- Labels or markers\n- Picture or book showing the life cycle of a plant\n\nIntroduction:\n1. Gather the children in a circle and start a discussion about plants and where they come from.\n2. Show the picture or book depicting the life cycle of a plant and introduce the concept of seed saving.\n3. Ask questions like:\n   - Do you know where plants come from?\n   - Have you ever seen a seed before? What does it look like?\n   - Why do you think seeds are important?\n\nActivities:\n1. Seed Exploration:\n   - Show children different types of seeds and allow them to observe and touch them.\n   - Talk about the different sizes, shapes, and colors of the seeds.\n   - Help children identify the parts of a seed (e.g., the seed coat, embryo).\n   - Ask questions like:\n     - Can you describe what the seed feels like?\n     - Can you find the little baby plant inside the seed?\n\n2. Seed Collection:\n   - Provide large containers or jars and encourage children to collect seeds they find in fruits or vegetables during snack or mealtime.\n   - Talk about the importance of collecting and saving seeds to grow new plants.\n   - Help children label and store their collected seeds.\n   - Ask questions like:\n     - What types of seeds are you collecting?\n     - How do you think we can keep the seeds safe until we're ready to plant them?\n\n3. Planting Seeds:\n   - Give each child a paper cup or small pot filled with soil.\n   - Instruct them to plant a seed in their container and water it gently.\n   - Discuss the basic needs of plants, such as sunlight, water, and nutrients.\n   - Ask questions like:\n     - What do you think will happen to the seed when we give it water and sunlight?\n     - How often do you think we should water the seed?\n\nClosure:\n1. Gather the children back in a circle and have a discussion about what they have learned.\n2. Show the collected seeds and ask children to share their experiences in seed saving.\n3. Ask questions like:\n   - Why do you think it's important to save seeds?\n   - Can you tell me the parts of a seed?\n   - What do you think will happen to the seeds we've collected in the future?\n\nExtension Activities:\n1. Garden Visit:\n   - Take a field trip to a local garden or nursery where children can see a variety of plants and seeds.\n   - Engage in a guided tour or activity where they can further explore seed-saving techniques.\n   - Encourage them to ask questions to the gardeners or staff.\n\n2. Seed Art:\n   - Provide a variety of seeds, glue, and paper/canvas.\n   - Encourage children to create artwork using the seeds, arranging them into different shapes or patterns.\n   - Have a discussion about the unique properties of seeds and their varied textures.\n\n3. Plant Observation:\n   - Have children monitor the growth of their planted seeds over a period of time.\n   - Enlist their help in recording observations in a journal or drawing pictures of the changes they observe.\n   - Discuss the different stages of a plant's life cycle and ask questions like:\n     - What do you notice about the seed as it begins to grow?\n     - How does the plant look different from when it was just a seed?\n\nRemember to provide opportunities for hands-on exploration and use age-appropriate language and explanations. Encourage curiosity, active participation, and discussions throughout the lesson."
    },
    {
      "role": "user",
      "content": "/lessonplan"
    },
    {
      "role": "assistant",
      "content": "I'm sorry, but I need to know the specific topic and age group for the lesson plan. Could you please provide more details?"
    },
    {
      "role": "user",
      "content": "astronauts 2-3 year olds"
    },
    {
      "role": "assistant",
      "content": "Topic: Astronauts\nAge Group: 2-3\n\nObjective:\nBy the end of the lesson, children will be able to:\n1. Become familiar with the concept of astronauts and space exploration.\n2. Engage in imaginative play as astronauts.\n3. Identify basic elements associated with astronauts and space (e.g., rockets, helmets, stars).\n\nMaterials:\n- Books or pictures related to astronauts and space exploration.\n- Dress-up costumes (e.g., astronaut suits, helmets).\n- Large cardboard boxes or chairs arranged as \"rocket ships.\"\n- Art supplies (e.g., crayons, paper, glue, glitter) for craft activities.\n- Space-themed toys or figurines.\n\nIntroduction:\n1. Gather the children in a circle and show them a picture of an astronaut or a book about astronauts.\n2. Talk about astronauts and explain that they explore space and travel in spaceships.\n3. Ask questions like:\n   - Have you ever seen an astronaut before? What do they wear?\n   - What do you think astronauts do in space?\n   - What are some things you might see in space?\n\nActivities:\n1. Dress-Up as Astronauts:\n   - Provide dress-up costumes such as astronaut suits, helmets, and boots.\n   - Allow children to dress up as astronauts and encourage imaginative play.\n   - Ask questions like:\n     - Where are you going in your spaceship?\n     - What do you see outside your spaceship window?\n\n2. Rocket Ship Adventure:\n   - Create a rocket ship using large cardboard boxes or chairs arranged in a spaceship shape.\n   - Let children take turns pretending to be astronauts and \"blast off\" into space.\n   - Encourage them to describe their journey and what they see outside.\n   - Ask questions like:\n     - What colors are the stars in space?\n     - Can you find any planets while you're exploring?\n\n3. Space Crafts:\n   - Provide art supplies such as crayons, paper, glue, and glitter.\n   - Let children create their own space-themed artwork (e.g., drawing a rocket ship, decorating a star).\n   - Engage in a discussion about their artwork and encourage them to describe what they have created.\n\nClosure:\n1. Gather the children back in a circle and have a conversation about what they learned today.\n2. Ask questions like:\n   - What do astronauts wear in space?\n   - What was your favorite part about being an astronaut?\n   - Can you tell me one thing you would take with you in your spaceship?\n\nExtension Activities:\n1. Moon Sand Exploration:\n   - Create a moon sand sensory bin using kinetic sand or a mixture of flour and oil.\n   - Provide space-themed objects and small astronaut toys.\n   - Allow children to explore and play in the moon sand, creating their own moon surface.\n\n2. Space Yoga:\n   - Incorporate simple yoga movements and poses related to space and astronauts.\n   - Guide children through movements like rocket ship pose, star pose, or astronaut reaching for the stars.\n\n3. Listen to Space Sounds:\n   - Play recordings or videos of space sounds, such as rocket launches, astronaut communications, or sounds of planets.\n   - Encourage children to discuss what they hear and how they think those sounds were made.\n\nRemember to keep the activities engaging, use simple language, and provide opportunities for movement and exploration. Adapt the lessons to the developmental level of the children and provide ample support and supervision during dress-up and imaginative play."
    }
  ],
  temperature: 1,
  max_tokens: 1500,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stream: true,
});

    const fullLessonPlan = chatResponse.choices[0]?.message?.content || "No lesson plan available.";
    const parsedLessonPlan = splitLessonPlan(fullLessonPlan);
    return parsedLessonPlan;

  } catch (error) {
    console.error("Error in getLessonPlan:", error);
    return "Sorry, an error occurred while generating the lesson plan.";
  }
}


export { openai as OpenAI };
