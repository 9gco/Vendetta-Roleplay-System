const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');
const play = require('play-dl');

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
    const query = interaction.options.getString('song');
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

    await interaction.deferReply();

    try {
      await client.music.connect(interaction.guild, voiceChannel, interaction.channel);

      let songData;
      let searchQuery = query;

      if (play.yt_validate(query) === 'video') {
        const info = await play.video_info(query);
        songData = {
          title: info.video_details.title,
          url: info.video_details.url,
          duration: info.video_details.durationInSec,
          thumbnail: info.video_details.thumbnails[0]?.url,
          requester: interaction.user.tag,
        };
      } else if (play.yt_validate(query) === 'playlist') {
        const playlist = await play.playlist_info(query, { incomplete: true });
        const videos = await playlist.all_videos();

        for (const video of videos) {
          await client.music.addToQueue(interaction.guild.id, {
            title: video.title,
            url: video.url,
            duration: video.durationInSec,
            thumbnail: video.thumbnails[0]?.url,
            requester: interaction.user.tag,
          });
        }

        const queue = client.music.getQueue(interaction.guild.id);
        if (!queue.playing) {
          await client.music.play(interaction.guild.id);
        }

        return interaction.editReply({
          embeds: [SakuraEmbed.success('Playlist hinzugefügt', `${config.emojis.music} **${videos.length}** Songs aus der Playlist **${playlist.title}** wurden zur Warteschlange hinzugefügt.`)],
        });
      } else {
        const results = await play.search(query, { limit: 1 });
        if (!results.length) {
          return interaction.editReply({
            embeds: [SakuraEmbed.error('Keine Ergebnisse', `Für \`${query}\` wurden keine Ergebnisse gefunden.`)],
          });
        }
        songData = {
          title: results[0].title,
          url: results[0].url,
          duration: results[0].durationInSec,
          thumbnail: results[0].thumbnails[0]?.url,
          requester: interaction.user.tag,
        };
      }

      if (!songData) {
        return interaction.editReply({
          embeds: [SakuraEmbed.error('Fehler', 'Der Song konnte nicht geladen werden.')],
        });
      }

      const position = await client.music.addToQueue(interaction.guild.id, songData);
      const queue = client.music.getQueue(interaction.guild.id);

      if (!queue.playing) {
        const played = await client.music.play(interaction.guild.id);
        const duration = client.music.getFormattedDuration(played.duration);
        const embed = SakuraEmbed.custom({
          title: `${config.emojis.music} Jetzt läuft`,
          description: `[${played.title}](${played.url})\n\nDauer: \`${duration}\`\nAngefordert von: ${played.requester}`,
          color: config.colors.secondary,
          thumbnail: played.thumbnail,
        });
        return interaction.editReply({ embeds: [embed] });
      }

      const duration = client.music.getFormattedDuration(songData.duration);
      const embed = SakuraEmbed.custom({
        title: `${config.emojis.music} Zur Warteschlange hinzugefügt`,
        description: `[${songData.title}](${songData.url})\n\nPosition: \`#${position}\`\nDauer: \`${duration}\`\nAngefordert von: ${songData.requester}`,
        color: config.colors.primary,
        thumbnail: songData.thumbnail,
      });
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Play error:', error);
      await interaction.editReply({
        embeds: [SakuraEmbed.error('Fehler', `Beim Abspielen ist ein Fehler aufgetreten: ${error.message}`)],
      });
    }
  }
};
