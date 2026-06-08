const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { SakuraEmbed, SakuraButtons } = require('../../utils/embedBuilder');

// Wir laden die gefakte Config, die wir auf Render erzeugen, oder die lokale Datei
let config = {};
try {
    config = require('../../config.json');
} catch (e) {
    config = { emojis: { ribbon: '🎀', star: '⭐', leaf: '🍃', ticket: '🎫' } };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticketsystem Befehle')
        .addSubcommand(sub => 
            sub.setName('panel')
               .setDescription('Sendet das Ticket-Erstellungs-Panel')
        )
        .addSubcommand(sub =>
            sub.setName('create')
               .setDescription('Erstellt direkt ein Ticket per Formular')
        )
        .addSubcommand(sub =>
            sub.setName('close')
               .setDescription('Schließt das aktuelle Ticket')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 
        
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'panel') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    embeds: [SakuraEmbed.error('Keine Berechtigung', 'Nur Admins können das Ticket-Panel erstellen.')],
                    ephemeral: true
                });
            }

            const embed = SakuraEmbed.panel(
                'Support-Ticket erstellen',
                `${config.emojis?.ribbon || '🎀'} Brauchst du Hilfe? Erstelle ein Ticket und unser Team wird sich um dich kümmern!\n\n` +
                `${config.emojis?.star || '⭐'} **Wie es funktioniert:**\n` +
                `1. Klicke auf den Button unten\n` +
                `2. Wähle eine Kategorie aus\n` +
                `3. Beschreibe dein Anliegen\n` +
                `4. Warte auf unser Team\n\n` +
                `${config.emojis?.leaf || '🍃'} *Bitte erstelle kein Ticket für dringende Angelegenheiten.*`
            );

            const row = SakuraButtons.row(
                SakuraButtons.primary('create_ticket', 'Ticket erstellen', config.emojis?.ticket || '🎫')
            );

            await interaction.reply({ embeds: [embed], components: [row] });
            return;
        }

        if (subcommand === 'create') {
            const modal = new ModalBuilder()
                .setCustomId('ticket_modal')
                .setTitle(`${config.emojis?.ticket || '🎫'} Ticket erstellen`);

            const categoryInput = new TextInputBuilder()
                .setCustomId('ticket_category')
                .setLabel('Kategorie')
                .setPlaceholder('z.B. Support, Bug-Report, Frage, ...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const reasonInput = new TextInputBuilder()
                .setCustomId('ticket_reason')
                .setLabel('Dein Anliegen')
                .setPlaceholder('Beschreibe dein Anliegen so genau wie möglich...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(categoryInput);
            const row2 = new ActionRowBuilder().addComponents(reasonInput);

            modal.addComponents(row1, row2);

            await interaction.showModal(modal);
            return;
        }

        if (subcommand === 'close') {
            if (!interaction.channel.name.includes('ticket')) {
                return interaction.reply({
                    embeds: [SakuraEmbed.error('Kein Ticket', 'Dies ist kein Ticket-Channel.')],
                    ephemeral: true
                });
            }

            await interaction.reply({
                embeds: [SakuraEmbed.info('Ticket wird geschlossen', 'Das Ticket wird in 5 Sekunden geschlossen...')],
            });

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 5000);
        }
    }
};