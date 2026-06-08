const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');
const ms = require('ms');

module.exports = {
  name: 'mute',
  description: 'Stumm schalten eines Mitglieds (Timeout)',
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Stumm schalten eines Mitglieds (Timeout)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer der stummgeschaltet werden soll')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('dauer')
        .setDescription('Dauer (z.B. 10m, 1h, 1d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('grund')
        .setDescription('Grund der Stummschaltung')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Keine Berechtigung', 'Du benötigst die `Mitglieder moderieren` Berechtigung.')],
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const durationInput = interaction.options.getString('dauer');
    const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', 'Dieser Benutzer ist nicht auf dem Server.')],
        ephemeral: true
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', 'Ich kann diesen Benutzer nicht stumm schalten.')],
        ephemeral: true
      });
    }

    const duration = ms(durationInput);
    if (!duration || duration > 2419200000) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Ungültige Dauer', 'Maximal 28 Tage. Gültige Formate: 10m, 1h, 1d, 7d')],
        ephemeral: true
      });
    }

    try {
      await member.timeout(duration, reason);

      const embed = SakuraEmbed.success(
        `${config.emojis.mod} Mitglied stummgeschaltet`,
        `${user.tag} wurde für **${durationInput}** stummgeschaltet.`
      ).addFields(
        { name: 'Grund', value: reason, inline: true },
        { name: 'Dauer', value: durationInput, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', `Konnte den Benutzer nicht stumm schalten: ${error.message}`)],
        ephemeral: true
      });
    }
  }
};
