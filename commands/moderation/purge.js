const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'purge',
  description: 'Lösche mehrere Nachrichten auf einmal',
  aliases: ['clear', 'clean', 'delete'],
  category: 'moderation',
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Lösche mehrere Nachrichten auf einmal')
    .addIntegerOption(option =>
      option.setName('anzahl')
        .setDescription('Anzahl der zu löschenden Nachrichten (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Lösche nur Nachrichten eines bestimmten Benutzers')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Keine Berechtigung', 'Du benötigst die `Nachrichten verwalten` Berechtigung.')],
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger('anzahl');
    const user = interaction.options.getUser('user');

    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      let filtered = messages.filter(m => Date.now() - m.createdTimestamp < 1209600000);

      if (user) {
        filtered = filtered.filter(m => m.author.id === user.id);
      }

      const toDelete = filtered.first(amount);

      if (toDelete.length === 0) {
        return interaction.editReply({
          embeds: [SakuraEmbed.error('Keine Nachrichten', 'Es wurden keine passenden Nachrichten gefunden.')]
        });
      }

      await interaction.channel.bulkDelete(toDelete, true);

      const embed = SakuraEmbed.success(
        `${config.emojis.mod} Nachrichten gelöscht`,
        `${toDelete.length} Nachrichten wurden erfolgreich gelöscht.`
      ).addFields(
        { name: 'Kanal', value: `<#${interaction.channel.id}>`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true }
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        embeds: [SakuraEmbed.error('Fehler', `Konnte Nachrichten nicht löschen: ${error.message}`)]
      });
    }
  },

  async executePrefix(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Du hast keine Berechtigung.');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('❌ Bitte gib eine Zahl zwischen 1 und 100 an.');
    }

    try {
      const messages = await message.channel.bulkDelete(amount + 1, true);
      const msg = await message.channel.send(`✅ ${messages.size - 1} Nachrichten gelöscht.`);
      setTimeout(() => msg.delete().catch(() => {}), 3000);
    } catch (error) {
      message.reply(`❌ Fehler: ${error.message}`);
    }
  }
};
