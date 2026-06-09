const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    name: 'warn',
    description: 'Verwaltungssystem für Verwarnungen. 🛡️',
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Verwaltungssystem für Verwarnungen. 🛡️')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Verwarnt einen User auf dem Server.')
                .addUserOption(option => option.setName('user').setDescription('Der zu verwarnende User').setRequired(true))
                .addStringOption(option => option.setName('grund').setDescription('Grund für die Verwarnung').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Zeigt alle Verwarnungen eines Users an.')
                .addUserOption(option => option.setName('user').setDescription('Der zu prüfende User').setRequired(true))
        ),

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
        const guildId = interaction.guild.id;
        
        const embedColor = client.config?.colors?.sakura || '#FFB7C5';
        const dbKey = `warns_${guildId}_${targetUser.id}`;

        // ================= UNTERBEFEHL: ADD =================
        if (sub === 'add') {
            if (targetUser.bot) {
                return await interaction.reply({ content: '❌ Bots können nicht verwarnt werden.', ephemeral: true });
            }

            // Datenbank-Typen-Check: Holen & Reparieren falls nötig
            let history = await db.get(dbKey);
            if (!Array.isArray(history)) {
                history = []; // Setzt es zurück, falls es eine Zahl/String aus dem alten System war
            }

            // Neue Warnung hinzufügen
            const newWarn = {
                reason: reason,
                moderator: interaction.user.tag,
                date: new Date().toLocaleDateString('de-DE')
            };
            history.push(newWarn);

            // Zurück in die DB schreiben
            await db.set(dbKey, history);

            const embed = new EmbedBuilder()
                .setTitle('🛡️ User verwarnt')
                .setColor('#FF5555')
                .setDescription(`Der User ${targetUser} wurde erfolgreich verwarnt.`)
                .addFields(
                    { name: '👤 Verwarnt von', value: `${interaction.user.tag}`, inline: true },
                    { name: '📊 Verwarnungen insgesamt', value: `\`${history.length}\``, inline: true },
                    { name: '📝 Grund', value: reason, inline: false }
                )
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] });
        }

        // ================= UNTERBEFEHL: LIST =================
        if (sub === 'list') {
            let history = await db.get(dbKey);
            if (!Array.isArray(history)) history = [];

            if (history.length === 0) {
                return await interaction.reply({ content: `🌸 ${targetUser.tag} hat aktuell keine Verwarnungen.`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`📋 Verwarnungen für ${targetUser.tag}`)
                .setColor(embedColor)
                .setTimestamp();

            let description = `Gesamtanzahl: **${history.length}**\n\n`;
            history.forEach((warn, index) => {
                description += `**#${index + 1}** - ${warn.date}\n└ *Grund:* ${warn.reason}\n└ *Von:* ${warn.moderator}\n\n`;
            });

            embed.setDescription(description);
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};