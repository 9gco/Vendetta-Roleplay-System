const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'play',
  description: 'Spiele einen Song ab',
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Spiele einen Song ab')
    .addStringOption(option => option.setName('song').setDescription('Titel oder Link').setRequired(true)),

  async execute(interaction) {
    const player = useMainPlayer();
    const song = interaction.options.getString('song');
    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.reply({ content: 'Du musst in einem Voice-Channel sein!', ephemeral: true });

    // Sofort antworten, damit keine "Unknown interaction" Fehler kommen
    await interaction.deferReply();

    try {
      const { track } = await player.play(channel, song, {
        nodeOptions: {
          metadata: interaction // Damit wir später auf das Channel-Objekt zugreifen können
        }
      });

      return interaction.editReply({ content: `🎵 Läuft jetzt: **${track.title}**` });
    } catch (e) {
      console.error(e);
      return interaction.editReply({ content: '❌ Fehler beim Abspielen des Songs.' });
    }
  }
};