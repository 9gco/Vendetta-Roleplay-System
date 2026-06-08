const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'ban',
  description: 'Banne einen Mitglied vom Server',
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banne einen Mitglied vom Server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer der gebannt werden soll')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('grund')
        .setDescription('Grund des Banns')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('nachrichten')
        .setDescription('Anzahl der zu löschenden Nachrichten (0-7 Tage)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Keine Berechtigung', 'Du benötigst die `Mitglieder bannen` Berechtigung.')],
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    const deleteDays = interaction.options.getInteger('nachrichten') || 0;
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', 'Dieser Benutzer ist nicht auf dem Server.')],
        ephemeral: true
      });
    }

    if (!member.bannable) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', 'Ich kann diesen Benutzer nicht bannen.')],
        ephemeral: true
      });
    }

    if (interaction.member.roles.highest.position <= member.roles.highest.position) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', 'Du kannst diesen Benutzer nicht bannen.')],
        ephemeral: true
      });
    }

    try {
      await member.ban({ reason, deleteMessageDays: deleteDays });

      const embed = SakuraEmbed.success(
        `${config.emojis.shield} Mitglied gebannt`,
        `${user.tag} wurde erfolgreich gebannt.`
      ).addFields(
        { name: 'Grund', value: reason, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Nachrichten gelöscht', value: deleteDays > 0 ? `${deleteDays} Tage` : 'Keine', inline: true }
      );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', `Konnte den Benutzer nicht bannen: ${error.message}`)],
        ephemeral: true
      });
    }
  }
};
