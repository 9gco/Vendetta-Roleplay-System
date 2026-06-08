const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');
const moment = require('moment');

module.exports = {
  name: 'serverinfo',
  description: 'Zeigt Informationen über den Server',
  aliases: ['server', 'guild', 'guildinfo'],
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Zeigt Informationen über den Server'),

  async execute(interaction, client) {
    const guild = interaction.guild;
    await guild.members.fetch();

    const totalChannels = guild.channels.cache.size;
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;

    const totalMembers = guild.memberCount;
    const humans = guild.members.cache.filter(m => !m.user.bot).size;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;

    const roles = guild.roles.cache.size;
    const boosts = guild.premiumSubscriptionCount || 0;
    const boostLevel = guild.premiumTier;

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.rose} ${guild.name}`,
      color: config.colors.primary,
      thumbnail: guild.iconURL({ dynamic: true, size: 512 }),
      fields: [
        {
          name: `${config.emojis.crown} Besitzer`,
          value: `<@${guild.ownerId}>`,
          inline: true,
        },
        {
          name: `${config.emojis.star} Server ID`,
          value: `\`${guild.id}\``,
          inline: true,
        },
        {
          name: `${config.emojis.sakura} Erstellt`,
          value: moment(guild.createdAt).format('DD.MM.YYYY [um] HH:mm'),
          inline: true,
        },
        {
          name: `${config.emojis.ribbon} Mitglieder`,
          value: `👤 ${humans} • 🤖 ${bots}\n🟢 ${online} • 📊 ${totalMembers}`,
          inline: true,
        },
        {
          name: `${config.emojis.leaf} Kanäle`,
          value: `💬 ${textChannels} • 🔊 ${voiceChannels} • 📁 ${categories}`,
          inline: true,
        },
        {
          name: `${config.emojis.heart} Boosts`,
          value: `⭐ ${boosts} (Level ${boostLevel})`,
          inline: true,
        },
        {
          name: `${config.emojis.settings} Rollen`,
          value: `${roles} Rollen`,
          inline: true,
        },
      ],
      footer: { text: `Angefordert von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) },
    });

    if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  }
};
