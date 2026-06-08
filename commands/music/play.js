const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'play',
  description: 'Spiele einen Song oder eine Playlist ab',
  aliases: ['p', 'music', 'song'],
  category: 'music',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Spiele einen Song oder eine Playlist ab')
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Songname oder YouTube/Spotify URL')
        .setRequired(true)),

  async execute(interaction, client) {
    const song = interaction.options.getString('song');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Kein Voice-Channel', 'Du musst in einem Voice-Channel sein, um Musik abzuspielen.')],
        ephemeral: true
      });
    }

    const permissions = voiceChannel.permissionsFor(client.user);
    if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
      return interaction.reply({
        embeds: [SakuraEmbed.error('Fehlende Berechtigungen', 'Ich habe keine Berechtigung, diesem Voice-Channel beizutreten oder zu sprechen.')],
        ephemeral: true
      });
    }

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.music} Musik wird geladen...`,
      description: `${config.emojis.loading} Suche nach: \`${song}\`\n\n${config.emojis.leaf} *Installiere hierfür das Paket \`discord-player\` oder \`play-dl\`*`,
      color: config.colors.secondary,
    });

    await interaction.reply({ embeds: [embed] });
  }
};
