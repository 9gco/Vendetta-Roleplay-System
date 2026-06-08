const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

class EventHandler {
  static load(client) {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    let loaded = 0;
    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      loaded++;
      Logger.debug(`Event geladen: ${event.name}`);
    }

    Logger.success(`${loaded} Events erfolgreich geladen ${'🌸'}`);
  }
}

module.exports = EventHandler;
