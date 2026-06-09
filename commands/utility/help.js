const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Zeigt eine Liste aller verfügbaren Befehle an. 🌸'),

    async execute(interaction, client) {
        // Wir holen die Farben aus der Config, falls vorhanden, sonst Standard-Rosa
        const embedColor = client.config?.colors?.sakura || '#FFB7C5';

        const embed = new EmbedBuilder()
            .setTitle('🌸 Vendetta Roleplay - Hilfemenü')
            .setDescription(
                'Willkommen beim Vendetta System! Hier ist eine Übersicht deiner Möglichkeiten:\n\n' +
                '**🎫 Ticketsystem:**\n' +
                '• `/ticket panel` - Erstellt das Support-Panel\n' +
                '• `/ticket close` - Schließt ein Ticket\n\n' +
                '**🛡️ Moderation:**\n' +
                '• `/warn` - Verwarnt einen User\n\n' +
                '💡 *Tippe einfach ein `/` in den Chat, um alle weiteren Befehle und deren Beschreibungen live zu sehen!*'
            )
            .setColor(embedColor)
            .setFooter({ 
                text: `Vendetta System • Version 1.0`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        // Überprüfen, ob es ein Slash-Command (Interaction) oder ein Text-Befehl ist
        if (interaction.reply) {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (interaction.channel) {
            // Fallback für alte Präfix-Befehle (!help)
            await interaction.channel.send({ embeds: [embed] });
        }
    }
};