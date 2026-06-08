const Logger = require('../utils/logger');
const config = require('../config.json');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    Logger.startup(`🌸 ${client.user.tag} ist bereit!`);

    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    Logger.info(`Server: ${client.guilds.cache.size}`);
    Logger.info(`Benutzer: ${totalUsers}`);
    Logger.info(`Befehle: ${client.slashCommands.size}`);

    const activities = [
      { name: '🌸 Sakura Dreams', type: 3 },
      { name: `${client.guilds.cache.size} Server`, type: 3 },
      { name: `${config.prefix}help | /help`, type: 0 },
      { name: '🌸 Vendetta System', type: 5 },
    ];

    let index = 0;
    setInterval(() => {
      client.user.setActivity(activities[index].name, { type: activities[index].type });
      index = (index + 1) % activities.length;
    }, 15000);

    Logger.success(`Bot-Status aktiv. ${config.emojis.sakura}`);
  },
};
