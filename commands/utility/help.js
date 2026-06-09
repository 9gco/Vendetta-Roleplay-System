const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Zeigt eine Liste aller verfügbaren Befehle an. 🌸'),

    async execute(interaction, client) {
        const embedColor = client.config?.colors?.sakura || '#FFB7C5';
        const embed = new EmbedBuilder()
            .setTitle('🌸 Vendetta Roleplay - Hilfemenü')
            .setDescription('Bot läuft! Tippe ein `/` in den Chat, um alle Befehle zu sehen.')
            .setColor(embedColor);

        if (interaction.reply) {
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            return await interaction.channel.send({ embeds: [embed] });
        }
    }
};