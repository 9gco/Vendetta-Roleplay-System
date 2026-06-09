const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticketsystem Befehle')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction, client) {
        if (interaction.reply) {
            return await interaction.reply({ content: 'Ticketsystem aktiv!', ephemeral: true });
        }
    }
};