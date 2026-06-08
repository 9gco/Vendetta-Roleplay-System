const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');
const Database = require('quick.db');
const db = new Database.table('levels');

module.exports = {
  name: 'level',
  description: 'Zeige dein Level und XP an',
  aliases: ['rank', 'xp', 'lvl'],
  category: 'system',
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Zeige dein Level und XP an')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer')
        .setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild.id;

    const data = db.get(`${guildId}.${user.id}`) || { xp: 0, level: 1 };

    const xpForNextLevel = data.level * 100;
    const progress = Math.min((data.xp / xpForNextLevel) * 100, 100);
    const progressBar = createProgressBar(progress);

    const allUsers = db.all().filter(entry => entry.ID.startsWith(guildId));
    const sorted = allUsers.sort((a, b) => {
      const dataA = a.data || { xp: 0, level: 1 };
      const dataB = b.data || { xp: 0, level: 1 };
      return (dataB.level * 1000 + dataB.xp) - (dataA.level * 1000 + dataA.xp);
    });
    const rank = sorted.findIndex(entry => entry.ID === `${guildId}.${user.id}`) + 1;

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.level} Rang von ${user.username}`,
      color: config.colors.primary,
      thumbnail: user.displayAvatarURL({ dynamic: true, size: 256 }),
      fields: [
        { name: `${config.emojis.crown} Level`, value: `**${data.level}**`, inline: true },
        { name: `${config.emojis.star} XP`, value: `${data.xp} / ${xpForNextLevel}`, inline: true },
        { name: `${config.emojis.ribbon} Rang`, value: `#${rank}`, inline: true },
        { name: `${config.emojis.heart} Fortschritt`, value: progressBar, inline: false },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  }
};

function createProgressBar(percent) {
  const filled = '█';
  const empty = '░';
  const total = 10;
  const filledCount = Math.round(percent / 10);
  const emptyCount = total - filledCount;

  const bar = filled.repeat(Math.max(0, filledCount)) + empty.repeat(Math.max(0, emptyCount));
  return `\`${bar}\` ${percent.toFixed(1)}%`;
}
