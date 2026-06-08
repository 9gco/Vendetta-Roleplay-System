const { SakuraEmbed } = require('../utils/embedBuilder');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberAdd',
  once: false,
  async execute(member, client) {
    const channel = member.guild.channels.cache.find(
      ch => ch.name.includes('willkommen') || ch.name.includes('welcome') || ch.name.includes('ankunft')
    );

    if (!channel) return;

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.sakura} Willkommen auf dem Server!`,
      description: `Hallo ${member}, willkommen auf **${member.guild.name}**! 🎀\n\n${config.emojis.ribbon} Wir freuen uns, dich hier zu haben!\n${config.emojis.leaf} Lies dir gerne die Regeln durch.\n${config.emojis.star} Hab eine wundervolle Zeit!`,
      color: config.colors.primary,
      thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 512 }),
      footer: { text: `Mitglied #${member.guild.memberCount}`, iconURL: member.guild.iconURL({ dynamic: true }) },
    });

    channel.send({ embeds: [embed], content: `${config.emojis.sakura} ${member}` });

    const autorole = member.guild.roles.cache.find(r => r.name.toLowerCase() === 'mitglied');
    if (autorole) {
      try {
        await member.roles.add(autorole);
      } catch (err) {
        console.error(`Autorole Fehler: ${err.message}`);
      }
    }
  },
};
