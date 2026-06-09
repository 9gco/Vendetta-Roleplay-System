const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const os = require('os');

module.exports = {
    name: 'botinfo',
    description: 'Zeigt detaillierte Informationen und Statistiken über den Bot an. 🌸',
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Zeigt detaillierte Informationen und Statistiken über den Bot an. 🌸'),

    async execute(interaction, client) {
        // Berechne die Uptime des Bots
        const totalSeconds = (client.uptime / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const uptimeString = `${days}t ${hours}std ${minutes}min ${seconds}sek`;

        // RAM-Nutzung auslesen
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        
        // Farbe aus Config oder Standard-Rosa
        const embedColor = client.config?.colors?.sakura || '#FFB7C5';

        const embed = new EmbedBuilder()
            .setTitle('🤖 Bot-Statistiken & Informationen')
            .setColor(embedColor)
            .setDescription('Hier findest du alle aktuellen technischen Details zum Vendetta System:')
            .addFields(
                { name: '🌸 Bot-Name', value: `${client.user.tag}`, inline: true },
                { name: '🆔 Bot-ID', value: `${client.user.id}`, inline: true },
                { name: '👑 Entwickler', value: 'Vendetta Team', inline: true },
                
                { name: '📊 Statistiken', value: `• **Server:** ${client.guilds.cache.size}\n• **Nutzer:** ${client.users.cache.size}\n• **Befehle:** ${client.commands.size}`, inline: false },
                
                { name: '⚙️ Technische Details', value: `• **Node.js Version:** ${process.version}\n• **Discord.js Version:** v${version}\n• **RAM-Verbrauch:** ${memoryUsage} MB\n• **Plattform:** ${os.platform()}`, inline: false },
                
                { name: '⏱️ Online seit', value: `\`${uptimeString}\``, inline: false }
            )
            .setFooter({ 
                text: `Angeforderte Infos von ${interaction.user.tag}`, 
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
            })
            .setTimestamp();

        // Absichern der Antwort
        if (interaction.reply) {
            await interaction.reply({ embeds: [embed], ephemeral: false });
        } else {
            await interaction.channel.send({ embeds: [embed] });
        }
    }
};