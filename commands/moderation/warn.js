const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');
const Database = require('quick.db');
const db = new Database.table('warns');

module.exports = {
  name: 'warn',
  description: 'Verwarne einen Mitglied',
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Verwalte Verwarnungen')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Verwarne einen Mitglied')
        .addUserOption(opt => opt.setName('user').setDescription('Der Benutzer').setRequired(true))
        .addStringOption(opt => opt.setName('grund').setDescription('Grund der Verwarnung').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('Zeige Verwarnungen eines Mitglieds')
        .addUserOption(opt => opt.setName('user').setDescription('Der Benutzer').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Lösche alle Verwarnungen eines Mitglieds')
        .addUserOption(opt => opt.setName('user').setDescription('Der Benutzer').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Keine Berechtigung', 'Du benötigst die `Mitglieder moderieren` Berechtigung.')],
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const guildId = interaction.guild.id;

    if (subcommand === 'add') {
      const reason = interaction.options.getString('grund');

      const warns = db.get(`${guildId}.${user.id}`) || [];
      warns.push({
        id: warns.length + 1,
        reason,
        moderator: interaction.user.tag,
        date: new Date().toISOString()
      });
      db.set(`${guildId}.${user.id}`, warns);

      const embed = SakuraEmbed.warning(
        `${config.emojis.warn} Mitglied verwarnt`,
        `${user.tag} wurde verwarnt.`
      ).addFields(
        { name: 'Grund', value: reason, inline: true },
        { name: 'Verwarnungen', value: `${warns.length}`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      );

      await interaction.reply({ embeds: [embed] });

      const member = interaction.guild.members.cache.get(user.id);
      if (member) {
        try {
          await member.send({
            embeds: [SakuraEmbed.warning(
              'Du wurdest verwarnt',
              `Auf **${interaction.guild.name}** wurdest du verwarnt.\n\n**Grund:** ${reason}`
            )]
          });
        } catch (e) {}
      }
    }

    else if (subcommand === 'list') {
      const warns = db.get(`${guildId}.${user.id}`) || [];

      if (warns.length === 0) {
        return interaction.reply({
          embeds: [SakuraEmbed.info('Keine Verwarnungen', `${user.tag} hat keine Verwarnungen.`)]
        });
      }

      const embed = SakuraEmbed.custom({
        title: `${config.emojis.warn} Verwarnungen von ${user.tag}`,
        color: config.colors.warning,
        description: warns.map(w =>
          `**#${w.id}** – ${w.reason}\n${config.emojis.ribbon} Von: ${w.moderator} am ${new Date(w.date).toLocaleDateString('de-DE')}`
        ).join('\n\n'),
        thumbnail: user.displayAvatarURL({ dynamic: true })
      });

      await interaction.reply({ embeds: [embed] });
    }

    else if (subcommand === 'clear') {
      db.delete(`${guildId}.${user.id}`);

      const embed = SakuraEmbed.success(
        `${config.emojis.success} Verwarnungen gelöscht`,
        `Alle Verwarnungen von ${user.tag} wurden gelöscht.`
      );

      await interaction.reply({ embeds: [embed] });
    }
  }
};
