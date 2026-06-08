const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');
const moment = require('moment');

module.exports = {
  name: 'userinfo',
  description: 'Zeigt Informationen über einen Benutzer',
  aliases: ['user', 'whois', 'member'],
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Zeigt Informationen über einen Benutzer')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer')
        .setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const roles = member?.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString());

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.ribbon} ${user.tag}`,
      color: member?.displayHexColor || config.colors.primary,
      thumbnail: user.displayAvatarURL({ dynamic: true, size: 512 }),
      fields: [
        {
          name: `${config.emojis.star} Benutzer ID`,
          value: `\`${user.id}\``,
          inline: true,
        },
        {
          name: `${config.emojis.crown} Bot`,
          value: user.bot ? 'Ja' : 'Nein',
          inline: true,
        },
        {
          name: `${config.emojis.sakura} Discord beigetreten`,
          value: moment(user.createdAt).format('DD.MM.YYYY [um] HH:mm'),
          inline: true,
        },
        {
          name: `${config.emojis.leaf} Server beigetreten`,
          value: member ? moment(member.joinedAt).format('DD.MM.YYYY [um] HH:mm') : 'Nicht auf diesem Server',
          inline: true,
        },
        {
          name: `${config.emojis.rose} Höchste Rolle`,
          value: member ? (member.roles.highest.id === interaction.guild.id ? 'Keine' : member.roles.highest.toString()) : 'Unbekannt',
          inline: true,
        },
        {
          name: `${config.emojis.heart} Rollen (${roles?.length || 0})`,
          value: roles?.slice(0, 10).join(' ') || 'Keine',
          inline: false,
        },
      ],
      footer: { text: `Angefordert von ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) },
    });

    if (user.bannerURL()) embed.setImage(user.bannerURL({ size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  }
};
