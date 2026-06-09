const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require('play-dl');
const { SakuraEmbed } = require('./embedBuilder');

class MusicManager {
  constructor() {
    this.queues = new Map();
  }

  getQueue(guildId) {
    let queue = this.queues.get(guildId);
    if (!queue) {
      queue = {
        songs: [],
        currentSong: null,
        connection: null,
        player: createAudioPlayer(),
        volume: 50,
        loopMode: 'none',
        playing: false,
        textChannel: null,
      };

      queue.player.on(AudioPlayerStatus.Idle, () => {
        this.playNext(guildId);
      });

      queue.player.on('error', (error) => {
        console.error(`Player error in ${guildId}:`, error.message);
        this.playNext(guildId);
      });

      this.queues.set(guildId, queue);
    }
    return queue;
  }

  async connect(guild, voiceChannel, textChannel) {
    const queue = this.getQueue(guild.id);
    queue.textChannel = textChannel;

    if (queue.connection && queue.connection.joinConfig.channelId === voiceChannel.id) {
      return queue.connection;
    }

    if (queue.connection) {
      queue.connection.destroy();
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      connection.subscribe(queue.player);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.SigningIn, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch {
        this.leave(guild.id);
      }
    });

    queue.connection = connection;
    return connection;
  }

  async addToQueue(guildId, song) {
    const queue = this.getQueue(guildId);
    queue.songs.push(song);
    return queue.songs.length;
  }

  async play(guildId) {
    const queue = this.getQueue(guildId);

    if (!queue.songs.length || queue.playing) return;

    queue.playing = true;
    const song = queue.songs.shift();
    queue.currentSong = song;

    try {
      const stream = await play.stream(song.url, {
        quality: 2,
        volume: queue.volume / 100,
      });

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true,
      });

      resource.volume.setVolume(queue.volume / 100);
      queue.player.play(resource);

      return song;
    } catch (error) {
      queue.playing = false;
      queue.currentSong = null;
      throw error;
    }
  }

  async playNext(guildId) {
    const queue = this.getQueue(guildId);

    if (queue.loopMode === 'song' && queue.currentSong) {
      queue.songs.unshift({ ...queue.currentSong });
    } else if (queue.loopMode === 'queue' && queue.currentSong) {
      queue.songs.push({ ...queue.currentSong });
    }

    queue.playing = false;
    queue.currentSong = null;

    if (queue.songs.length > 0) {
      await this.play(guildId);
    } else {
      queue.playing = false;
      if (queue.textChannel) {
        queue.textChannel.send({
          embeds: [SakuraEmbed.info('Warteschlange leer', 'Die Warteschlange ist leer. Füge neue Songs mit `/play` hinzu.')]
        });
      }
    }
  }

  skip(guildId) {
    const queue = this.getQueue(guildId);
    if (queue.player) {
      queue.player.stop();
      return true;
    }
    return false;
  }

  stop(guildId) {
    const queue = this.getQueue(guildId);
    queue.songs = [];
    queue.currentSong = null;
    queue.playing = false;
    if (queue.player) {
      queue.player.stop();
    }
  }

  leave(guildId) {
    const queue = this.getQueue(guildId);
    if (queue.connection) {
      queue.connection.destroy();
    }
    this.queues.delete(guildId);
  }

  pause(guildId) {
    const queue = this.getQueue(guildId);
    if (queue.player) {
      queue.player.pause();
      return true;
    }
    return false;
  }

  resume(guildId) {
    const queue = this.getQueue(guildId);
    if (queue.player) {
      queue.player.unpause();
      return true;
    }
    return false;
  }

  setVolume(guildId, volume) {
    const queue = this.getQueue(guildId);
    queue.volume = Math.max(0, Math.min(200, volume));
    if (queue.player && queue.player.state.resource) {
      queue.player.state.resource.volume.setVolume(queue.volume / 100);
    }
    return queue.volume;
  }

  setLoopMode(guildId, mode) {
    const queue = this.getQueue(guildId);
    queue.loopMode = mode;
    return mode;
  }

  shuffle(guildId) {
    const queue = this.getQueue(guildId);
    for (let i = queue.songs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
    }
    return true;
  }

  remove(guildId, index) {
    const queue = this.getQueue(guildId);
    if (index < 0 || index >= queue.songs.length) return null;
    return queue.songs.splice(index, 1)[0];
  }

  getFormattedDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  createProgressBar(current, total, length = 15) {
    const percent = total > 0 ? current / total : 0;
    const filled = Math.round(length * percent);
    const empty = length - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${this.getFormattedDuration(current)}/${this.getFormattedDuration(total)}`;
  }
}

module.exports = new MusicManager();
