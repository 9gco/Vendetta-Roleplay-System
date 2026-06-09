const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { SakuraEmbed, SakuraButtons } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'ticket',
  description: 'Erstelle ein Support-Ticket',
  aliases: ['support', 'helpme'],
  category: 'system',
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Erstelle ein Support-Ticket')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Erstelle ein neues Ticket'))
    .addSubcommand(sub =>
      sub.setName('close')
        .setDescription('Schließe dein aktuelles Ticket'))
    .addSubcommand(sub =>
      sub.setName('panel')
        .setDescription('Erstelle das Ticket-Panel (Admin)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)),

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
        `${config.emojis.ribbon} Brauchst du Hilfe? Erstelle ein Ticket und unser Team wird sich um dich kümmern!\n\n` +
        `${config.emojis.star} **Wie es funktioniert:**\n` +
        `1. Klicke auf den Button unten\`\`\`\n` +
        `2. Wähle eine Kategorie aus\n` +
        `3. Beschreibe dein Anliegen\n` +
        `4. Warte auf unser Team\n\`\`\`\n` +
        `${config.emojis.leaf} *Bitte erstelle kein Ticket für dringende Angelegenheiten.*`
      );

      const row = SakuraButtons.row(
        SakuraButtons.primary('create_ticket', 'Ticket erstellen', config.emojis.ticket)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
      return;
    }

    if (subcommand === 'create') {
      const modal = new ModalBuilder()
        .setCustomId('ticket_modal')
        .setTitle(`${config.emojis.ticket} Ticket erstellen`);

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
