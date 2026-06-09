const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Zeigt eine Liste aller verfügbaren Befehle an. 🌸',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Zeigt eine Liste aller verfügbaren Befehle an. 🌸'),

    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle('🌸 Vendetta System - Hilfe')
            .setDescription('Nutze `/`, um alle Befehle deines Servers zu sehen!')
            .setColor('#FFB7C5');
        
        if (interaction.reply) {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.channel.send({ embeds: [embed] });
        }
    }
};