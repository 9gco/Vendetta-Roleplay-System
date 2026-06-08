const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'stop',
  description: 'Stoppe die Wiedergabe und verlasse den Channel',
  aliases: ['leave', 'dc', 'disconnect'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stoppe die Wiedergabe und verlasse den Channel'),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein.')],
        ephemeral: true
      });
    }

    if (interaction.guild.members.me.voice.channel && interaction.guild.members.me.voice.channel !== voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Anderer Channel', 'Ich bin bereits in einem anderen Voice-Channel.')],
        ephemeral: true
      });
    }

    try {
      if (interaction.guild.members.me.voice.channel) {
        interaction.guild.members.me.voice.disconnect();
      }
      await interaction.reply({
        embeds: [SakuraEmbed.success('Gestoppt', `${config.emojis.music} Wiedergabe gestoppt und Channel verlassen.`)],
      });
    } catch (error) {
      await interaction.reply({
        embeds: [SakuraEmbed.error('Fehler', `Konnte nicht stoppen: ${error.message}`)],
        ephemeral: true
      });
    }
  }
};
