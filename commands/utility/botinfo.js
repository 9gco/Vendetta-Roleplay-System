const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const os = require('os');

module.exports = {
    name: 'botinfo',
    description: 'Zeigt Statistiken über den Bot an. 🌸',
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Zeigt Statistiken über den Bot an. 🌸'),

    async execute(interaction, client) {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m`;

        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const embed = new EmbedBuilder()
            .setTitle('🌸 Vendetta System - Info')
            .setColor('#FFB7C5')
            .addFields(
                { name: '🤖 Bot', value: `${client.user.username}`, inline: true },
                { name: '🟢 Uptime', value: `\`${uptimeString}\``, inline: true },
                { name: '💾 RAM', value: `\`${memory} MB\``, inline: true },
                { name: '👥 Server', value: `${client.guilds.cache.size}`, inline: true },
                { name: '⚙️ Library', value: `Discord.js v${version}`, inline: true }
            )
            .setTimestamp();

        return await interaction.reply({ embeds: [embed] });
    }
};