const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Spiele einen Song ab')
        .addStringOption(o => o.setName('song').setDescription('Titel oder Link').setRequired(true)),

    async execute(interaction) {
        // 1. DIESE ZEILE VERHINDERT DEN FEHLER "Anwendung reagiert nicht"
        await interaction.deferReply();

        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        if (!channel) {
            return interaction.editReply({ content: '❌ Du musst in einem Voice-Channel sein!' });
        }

        try {
            const song = interaction.options.getString('song');
            
            // Player spielt den Song
            const res = await player.play(channel, song, {
                nodeOptions: { metadata: interaction }
            });

            return interaction.editReply({ content: `🎵 Läuft jetzt: **${res.track.title}**` });
        } catch (e) {
            console.error(e);
            return interaction.editReply({ content: '❌ Fehler beim Abspielen. Ist der Link korrekt?' });
        }
    }
};