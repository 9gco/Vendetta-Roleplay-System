const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

class SakuraEmbed {
  static base() {
    return new EmbedBuilder()
      .setColor(config.colors.primary)
      .setFooter({
        text: '🌸 Vendetta System',
        iconURL: 'https://i.imgur.com/3z7qW9R.png'
      })
      .setTimestamp();
  }

  static success(title, description) {
    return this.base()
      .setColor(config.colors.success)
      .setTitle(`${config.emojis.sakura} ${title}`)
      .setDescription(description);
  }

  static error(title, description) {
    return this.base()
      .setColor(config.colors.error)
      .setTitle(`${config.emojis.error} ${title}`)
      .setDescription(description);
  }

  static warning(title, description) {
    return this.base()
      .setColor(config.colors.warning)
      .setTitle(`${config.emojis.warn} ${title}`)
      .setDescription(description);
  }

  static info(title, description) {
    return this.base()
      .setColor(config.colors.secondary)
      .setTitle(`${config.emojis.ribbon} ${title}`)
      .setDescription(description);
  }

  static custom(options) {
    const embed = this.base();
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.color) embed.setColor(options.color);
    if (options.fields) embed.addFields(options.fields);
    if (options.image) embed.setImage(options.image);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.author) embed.setAuthor(options.author);
    if (options.footer) embed.setFooter(options.footer);
    return embed;
  }

  static panel(title, description) {
    return this.base()
      .setColor(config.colors.dark)
      .setTitle(`${config.emojis.rose} ${title}`)
      .setDescription(description)
      .setImage('https://i.imgur.com/8kRqVFn.png');
  }

  static divider() {
    return `${config.emojis.leaf}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${config.emojis.leaf}`;
  }
}

class SakuraButtons {
  static link(label, url, emoji) {
    return new ButtonBuilder()
      .setLabel(label)
      .setURL(url)
      .setStyle(ButtonStyle.Link)
      .setEmoji(emoji || '🔗');
  }

  static primary(customId, label, emoji) {
    return new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Primary)
      .setEmoji(emoji || config.emojis.ribbon);
  }

  static secondary(customId, label, emoji) {
    return new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(emoji || config.emojis.leaf);
  }

  static success(customId, label, emoji) {
    return new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Success)
      .setEmoji(emoji || config.emojis.success);
  }

  static danger(customId, label, emoji) {
    return new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Danger)
      .setEmoji(emoji || config.emojis.error);
  }

  static row(...buttons) {
    return new ActionRowBuilder().addComponents(buttons);
  }
}

module.exports = { SakuraEmbed, SakuraButtons };
