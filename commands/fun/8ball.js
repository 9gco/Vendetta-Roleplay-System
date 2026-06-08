const { SlashCommandBuilder } = require('discord.js');
const { SakuraEmbed } = require('../../utils/embedBuilder');
const config = require('../../config.json');

module.exports = {
  name: '8ball',
  description: 'Die magische Sakura-Kugel beantwortet deine Frage',
  aliases: ['frage', 'magic8ball'],
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Die magische Sakura-Kugel beantwortet deine Frage')
    .addStringOption(option =>
      option.setName('frage')
        .setDescription('Deine Frage an die magische Kugel')
        .setRequired(true)),

  async execute(interaction, client) {
    const question = interaction.options.getString('frage');

    const responses = [
      '🌸 Es ist sicher.',
      '🎀 Ja, absolut!',
      '✨ Zweifellos.',
      '💖 Ja, definitiv.',
      '🌹 Du kannst darauf vertrauen.',
      '🍃 Meine Quellen sagen nein.',
      '❌ Sehr zweifelhaft.',
      '🌙 Die Aussichten sind gut.',
      '⭐ Konzentriere dich und frage nochmal.',
      '💫 Es wird sich zeigen...',
      '🌟 Ich sehe eine strahlende Zukunft.',
      '🎵 Ja, ohne Zweifel.',
      '🦋 Vielleicht... wer weiß?',
      '🍀 Die Zeichen stehen gut.',
      '💎 Darauf würde ich mich nicht verlassen.',
    ];

    const answer = responses[Math.floor(Math.random() * responses.length)];

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.star} Magische Sakura-Kugel`,
      color: config.colors.secondary,
      fields: [
        { name: `${config.emojis.ribbon} Deine Frage`, value: `\`${question}\`` },
        { name: `${config.emojis.heart} Antwort`, value: `**${answer}**` },
      ],
      thumbnail: 'https://i.imgur.com/3z7qW9R.png',
    });

    await interaction.reply({ embeds: [embed] });
  }
};
