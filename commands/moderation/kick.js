const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'kick',
  description: 'Kicke einen Mitglied vom Server',
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicke einen Mitglied vom Server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer der gekickt werden soll')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('grund')
        .setDescription('Grund des Kicks')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Keine Berechtigung', 'Du benötigst die `Mitglieder kicken` Berechtigung.')],
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', 'Dieser Benutzer ist nicht auf dem Server.')],
        ephemeral: true
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', 'Ich kann diesen Benutzer nicht kicken.')],
        ephemeral: true
      });
    }

    if (interaction.member.roles.highest.position <= member.roles.highest.position) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', 'Du kannst diesen Benutzer nicht kicken.')],
        ephemeral: true
      });
    }

    try {
      await member.kick(reason);

      const embed = SakuraEmbed.success(
        `${config.emojis.shield} Mitglied gekickt`,
        `${user.tag} wurde erfolgreich gekickt.`
      ).addFields(
        { name: 'Grund', value: reason, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', `Konnte den Benutzer nicht kicken: ${error.message}`)],
        ephemeral: true
      });
    }
  }
};
