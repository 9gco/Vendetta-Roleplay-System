const { SlashCommandBuilder, version } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');
const moment = require('moment');

module.exports = {
  name: 'botinfo',
  description: 'Zeigt Informationen über den Bot',
  aliases: ['bot', 'stats', 'info'],
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Zeigt Informationen über den Bot'),

  async execute(interaction, client) {
    const uptime = moment.duration(client.uptime);
    const uptimeStr = `${uptime.days()}d ${uptime.hours()}h ${uptime.minutes()}m ${uptime.seconds()}s`;

    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const totalChannels = client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0);

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.sakura} ${client.user.username} – Bot Info`,
      color: config.colors.primary,
      thumbnail: client.user.displayAvatarURL({ dynamic: true, size: 512 }),
      fields: [
        {
          name: `${config.emojis.crown} Entwickler`,
          value: config.owners.map(id => `<@${id}>`).join(', '),
          inline: true,
        },
        {
          name: `${config.emojis.star} Version`,
          value: 'v3.0.0',
          inline: true,
        },
        {
          name: `${config.emojis.heart} Discord.js`,
          value: `v${version}`,
          inline: true,
        },
        {
          name: `${config.emojis.leaf} Server`,
          value: `${client.guilds.cache.size}`,
          inline: true,
        },
        {
          name: `${config.emojis.ribbon} Benutzer`,
          value: `${totalUsers}`,
          inline: true,
        },
        {
          name: `${config.emojis.rose} Kanäle`,
          value: `${totalChannels}`,
          inline: true,
        },
        {
          name: `${config.emojis.shield} Befehle`,
          value: `${client.slashCommands.size}`,
          inline: true,
        },
        {
          name: `${config.emojis.loading} Betriebszeit`,
          value: uptimeStr,
          inline: true,
        },
        {
          name: `${config.emojis.settings} Ping`,
          value: `${Math.round(client.ws.ping)}ms`,
          inline: true,
        },
      ],
      footer: { text: `Gestartet am ${moment(client.readyAt).format('DD.MM.YYYY [um] HH:mm')}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) },
    });

    await interaction.reply({ embeds: [embed] });
  }
};
