const CommandHandler = require('../handlers/commandHandler');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Wenn es ein Slash-Command ist, überlassen wir dem CommandHandler das Ruder
        if (interaction.isChatInputCommand()) {
            await CommandHandler.handleSlash(interaction, client);
        }
    },
};