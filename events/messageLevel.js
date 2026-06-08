const { QuickDB } = require('quick.db');
const mainDb = new QuickDB();
const db = mainDb.table('levels'); // Ohne das Wort "new" vor "Database.table"!
const Logger = require('../utils/logger');

module.exports = {
  name: 'messageCreate',
  once: false,
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const cooldownKey = `cooldown_${guildId}_${userId}`;

    const cooldown = db.get(cooldownKey);
    if (cooldown && Date.now() - cooldown < 60000) return;

    db.set(cooldownKey, Date.now());

    const data = db.get(`${guildId}.${userId}`) || { xp: 0, level: 1 };
    const xpGain = Math.floor(Math.random() * 15) + 5;
    data.xp += xpGain;

    const xpForNextLevel = data.level * 100;
    if (data.xp >= xpForNextLevel) {
      data.xp -= xpForNextLevel;
      data.level += 1;

      Logger.info(`${message.author.tag} hat Level ${data.level} erreicht!`);
    }

    db.set(`${guildId}.${userId}`, data);
  },
};
