// registerCommands.js

export const registerCommands = (client) => {
    client.application.commands.create({
      name: 'lessonplan',
      description: 'Generate a lesson plan',
      options: [
        {
          name: 'topic',
          type: 'STRING',
          description: 'The topic for the lesson plan',
          required: true,
        },
        {
          name: 'agegroup',
          type: 'STRING',
          description: 'The age group for the lesson plan',
          required: true,
        },
      ],
    });
  };
  