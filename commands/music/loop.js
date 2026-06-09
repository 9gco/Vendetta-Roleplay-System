const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'loop',
  description: 'Schalte den Loop-Modus um (none/song/queue)',
  aliases: ['repeat'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Schalte den Loop-Modus um (none/song/queue)')
    .addStringOption(option =>
      option.setName('modus')
        .setDescription('Loop-Modus')
        .setRequired(true)
        .addChoices(
          { name: 'Kein Loop', value: 'none' },
          { name: 'Song wiederholen', value: 'song' },
          { name: 'Warteschlange wiederholen', value: 'queue' },
        )),

  async execute(interaction, client) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein.')],
        ephemeral: true
      });
    }

    const mode = interaction.options.getString('modus');
    const labels = { none: 'Kein Loop', song: '🔂 Song wiederholen', queue: '🔁 Warteschlange wiederholen' };

    client.music.setLoopMode(interaction.guild.id, mode);

    await interaction.reply({
      embeds: [SakuraEmbed.success('Loop-Modus geändert', `${config.emojis.music} Loop auf \`${labels[mode]}\` gesetzt.`)],
    });
  }
};
