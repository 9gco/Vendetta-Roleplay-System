const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: 'avatar',
  description: 'Zeigt das Profilbild eines Benutzers',
  aliases: ['pfp', 'profilepic'],
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Zeigt das Profilbild eines Benutzers')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer')
        .setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;

    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });
    const pngURL = user.displayAvatarURL({ dynamic: false, size: 4096, extension: 'png' });
    const jpgURL = user.displayAvatarURL({ dynamic: false, size: 4096, extension: 'jpg' });
    const webpURL = user.displayAvatarURL({ dynamic: false, size: 4096, extension: 'webp' });

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.ribbon} Profilbild von ${user.tag}`,
      color: config.colors.primary,
      image: { url: avatarURL },
      description: `🔗 [PNG](${pngURL}) • [JPG](${jpgURL}) • [WEBP](${webpURL})`,
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('PNG')
        .setURL(pngURL)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('JPG')
        .setURL(jpgURL)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('WEBP')
        .setURL(webpURL)
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
