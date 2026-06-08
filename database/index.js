const { QuickDB } = require('quick.db');
const db = new QuickDB();

// Dieser Trick erlaubt es dem alten Code, weiterhin "new Database.table()" zu nutzen:
db.table = function(tableName) {
    return db.table(tableName); 
};

// Falls der Code "new" erzwingt, tricksen wir JavaScript aus:
class DatabaseFake {
    constructor() {}
    table(name) {
        return db.table(name);
    }
}

// Wir exportieren ein Objekt, das sich wie die alte quick.db verhält
const oldStyleDb = new DatabaseFake();

module.exports = oldStyleDb;

class DatabaseManager {
  static init() {
    this.levels = new Database.table('levels');
    this.warns = new Database.table('warns');
    this.economy = new Database.table('economy');
    this.guilds = new Database.table('guilds');
    Logger.info('Datenbank initialisiert');
  }

  static getUserLevel(guildId, userId) {
    return this.levels.get(`${guildId}.${userId}`) || { xp: 0, level: 1 };
  }

  static addXP(guildId, userId, amount) {
    const data = this.getUserLevel(guildId, userId);
    data.xp += amount;

    const xpForNextLevel = data.level * 100;
    if (data.xp >= xpForNextLevel) {
      data.xp -= xpForNextLevel;
      data.level += 1;
      return { leveledUp: true, newLevel: data.level };
    }

    this.levels.set(`${guildId}.${userId}`, data);
    return { leveledUp: false, newLevel: data.level };
  }

  static getGuildConfig(guildId) {
    return this.guilds.get(guildId) || {};
  }

  static setGuildConfig(guildId, config) {
    this.guilds.set(guildId, config);
  }
}

module.exports = DatabaseManager;
