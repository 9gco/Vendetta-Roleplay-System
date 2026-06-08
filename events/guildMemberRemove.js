const { SakuraEmbed } = require('../utils/embedBuilder');
const config = require('../config.json');

module.exports = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member, client) {
    const channel = member.guild.channels.cache.find(
      ch => ch.name.includes('willkommen') || ch.name.includes('welcome') || ch.name.includes('ankunft')
    );

    if (!channel) return;

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.leaf} Auf Wiedersehen`,
      description: `${member.user.tag} hat den Server verlassen.\n\n${config.emojis.rose} Wir werden dich vermissen...`,
      color: config.colors.dark,
      thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 512 }),
      footer: { text: `Mitglieder: ${member.guild.memberCount}`, iconURL: member.guild.iconURL({ dynamic: true }) },
    });

    channel.send({ embeds: [embed] });
  },
};
