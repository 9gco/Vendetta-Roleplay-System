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
        // UNTERBEFEHL: add
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Verwarnt einen User auf dem Server.')
                .addUserOption(option => option.setName('user').setDescription('Der zu verwarnende User').setRequired(true))
                .addStringOption(option => option.setName('grund').setDescription('Grund für die Verwarnung').setRequired(false))
        )
        // UNTERBEFEHL: list
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Zeigt alle Verwarnungen eines Users an.')
                .addUserOption(option => option.setName('user').setDescription('Der zu prüfende User').setRequired(true))
        )
        // UNTERBEFEHL: remove (Einzelne Warnung löschen)
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Löscht eine bestimmte Verwarnung eines Users.')
                .addUserOption(option => option.setName('user').setDescription('Der User').setRequired(true))
                .addIntegerOption(option => option.setName('nummer').setDescription('Die Nummer der Verwarnung (siehe /warn list)').setRequired(true))
        )
        // UNTERBEFEHL: clear (Alle Warnungen löschen)
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Löscht ALLE Verwarnungen eines Users.')
                .addUserOption(option => option.setName('user').setDescription('Der User').setRequired(true))
        ),

    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');
        const guildId = interaction.guild.id;
        
        const embedColor = client.config?.colors?.sakura || '#FFB7C5';
        const dbKey = `warns_${guildId}_${targetUser.id}`;

        let history = await db.get(dbKey);
        if (!Array.isArray(history)) history = [];

        // ================= UNTERBEFEHL: ADD =================
        if (sub === 'add') {
            if (targetUser.bot) {
                return await interaction.reply({ content: '❌ Bots können nicht verwarnt werden.', ephemeral: true });
            }

            const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
            const newWarn = {
                reason: reason,
                moderator: interaction.user.tag,
                date: new Date().toLocaleDateString('de-DE')
            };
            history.push(newWarn);
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

        // ================= UNTERBEFEHL: REMOVE =================
        if (sub === 'remove') {
            const warnNum = interaction.options.getInteger('nummer');

            if (history.length === 0) {
                return await interaction.reply({ content: `❌ ${targetUser.tag} hat keine Verwarnungen, die gelöscht werden könnten.`, ephemeral: true });
            }

            // Da Listen bei 0 anfangen, die Nummer aber bei 1 startet:
            const index = warnNum - 1;

            if (index < 0 || index >= history.length) {
                return await interaction.reply({ content: `❌ Ungültige Nummer. Dieser User hat nur ${history.length} Verwarnung(en). Schau mit \`/warn list\` nach der korrekten Nummer.`, ephemeral: true });
            }

            // Entferne die Warnung aus dem Array
            const removedWarn = history.splice(index, 1)[0];
            
            // Datenbank aktualisieren
            if (history.length === 0) {
                await db.delete(dbKey); // Komplett löschen, wenn leer
            } else {
                await db.set(dbKey, history);
            }

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Verwarnung entfernt')
                .setColor('#55FF55') // Grün für Erfolg
                .setDescription(`Die Verwarnung **#${warnNum}** für ${targetUser} wurde gelöscht.`)
                .addFields(
                    { name: '📝 Gelöschter Grund', value: removedWarn.reason, inline: true },
                    { name: '👤 Verwarnt von', value: removedWarn.moderator, inline: true },
                    { name: '📊 Verbleibende Warns', value: `\`${history.length}\``, inline: false }
                )
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] });
        }

        // ================= UNTERBEFEHL: CLEAR =================
        if (sub === 'clear') {
            if (history.length === 0) {
                return await interaction.reply({ content: `🌸 ${targetUser.tag} hat sowieso keine Verwarnungen.`, ephemeral: true });
            }

            // Daten komplett aus der DB werfen
            await db.delete(dbKey);

            const embed = new EmbedBuilder()
                .setTitle('🧹 Alle Verwarnungen gelöscht')
                .setColor('#55FF55')
                .setDescription(`Sämtliche Verwarnungen (${history.length} Stück) für den User ${targetUser} wurden vollständig aus der Datenbank gelöscht.`)
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] });
        }
    }
};