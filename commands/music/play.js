async execute(interaction) {
    // 1. Sofort "denken" (verhindert "Die Anwendung reagiert nicht")
    await interaction.deferReply(); 

    const player = useMainPlayer();
    const song = interaction.options.getString('song');
    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.editReply({ content: 'Du bist in keinem Voice-Channel!' });

    try {
        // 2. Suche und spiele
        const res = await player.play(channel, song, { nodeOptions: { metadata: interaction } });
        return interaction.editReply({ content: `🎵 Läuft jetzt: **${res.track.title}**` });
    } catch (e) {
        return interaction.editReply({ content: '❌ Fehler beim Laden.' });
    }
}