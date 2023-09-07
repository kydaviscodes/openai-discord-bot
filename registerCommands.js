// registerCommands.js

export const registerCommands = (client) => {
    client.application.commands.create({
      name: 'lessonplan',
      description: 'Generate a lesson plan',
      options: [
        {
          name: 'topic',
          type: '3',
          description: 'The topic for the lesson plan',
          required: true,
        },
        {
          name: 'agegroup',
          type: '3',
          description: 'The age group for the lesson plan',
          required: true,
        },
      ],
    });
  };
  