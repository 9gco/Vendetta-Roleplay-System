const CommandHandler = require('../handlers/commandHandler');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    if (message.author.bot) return;
    await CommandHandler.handlePrefix(message, client);
  },
};
