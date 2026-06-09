const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Spiele einen Song ab')
        .addStringOption(o => o.setName('song').setDescription('Titel oder Link').setRequired(true)),

    async execute(interaction) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content: 'Du bist in keinem Voice-Channel!', ephemeral: true });

        await interaction.deferReply();

        try {
            const res = await player.play(channel, interaction.options.getString('song'), {
                nodeOptions: { metadata: interaction }
            });
            return interaction.editReply({ content: `🎵 Musik wird geladen: **${res.track.title}**` });
        } catch (e) {
            console.error(e);
            return interaction.editReply({ content: '❌ Fehler beim Abspielen.' });
        }
    }
};