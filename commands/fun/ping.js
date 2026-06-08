const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'ping',
  description: 'Zeigt die Latenz des Bots',
  aliases: ['latency', 'pong'],
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Zeigt die Latenz des Bots'),

  async execute(interaction, client) {
    const sent = await interaction.reply({
      embeds: [SakuraEmbed.custom({
        title: `${config.emojis.loading} Pinge...`,
        color: config.colors.secondary,
      })],
      fetchReply: true
    });

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.ribbon} Pong!`,
      color: config.colors.primary,
      fields: [
        { name: `${config.emojis.star} Bot Latenz`, value: `\`\`\`${sent.createdTimestamp - interaction.createdTimestamp}ms\`\`\``, inline: true },
        { name: `${config.emojis.heart} API Latenz`, value: `\`\`\`${Math.round(client.ws.ping)}ms\`\`\``, inline: true },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  }
};
