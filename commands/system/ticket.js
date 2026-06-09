const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'ticket',
    description: 'Ticketsystem Hauptbefehl',
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticketsystem Hauptbefehl')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        if (interaction.reply) {
            await interaction.reply({ content: 'Ticketsystem bereit.', ephemeral: true });
        }
    }
};