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
        // UNTERBEFEHL: remove
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Löscht eine bestimmte Verwarnung eines Users.')
                .addUserOption(option => option.setName('user').setDescription('Der User').setRequired(true))
                .addIntegerOption(option => option.setName('nummer').setDescription('Die Nummer der Verwarnung').setRequired(true))
        )
        // UNTERBEFEHL: clear
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
        const dbKey = `warns_${guildId}_${targetUser.id}`;

        // DB Daten abrufen
        let history = await db.get(dbKey);
        if (!Array.isArray(history)) history = [];

        // ================= ADD =================
        if (sub === 'add') {
            if (targetUser.bot) return await interaction.reply({ content: '❌ Bots können nicht verwarnt werden.', ephemeral: true });

            const reason = interaction.options.getString('grund') || 'Kein Grund angegeben';
            history.push({
                reason: reason,
                moderator: interaction.user.tag,
                date: new Date().toLocaleDateString('de-DE')
            });
            await db.set(dbKey, history);

            const embed = new EmbedBuilder()
                .setTitle('🛡️ User verwarnt')
                .setColor('#FF5555')
                .setDescription(`Der User ${targetUser} wurde verwarnt.`)
                .addFields({ name: '📝 Grund', value: reason, inline: false }, { name: '📊 Anzahl', value: `${history.length}`, inline: true })
                .setTimestamp();
            return await interaction.reply({ embeds: [embed] });
        }

        // ================= LIST =================
        if (sub === 'list') {
            if (history.length === 0) return await interaction.reply({ content: `🌸 ${targetUser.tag} hat keine Verwarnungen.`, ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle(`📋 Verwarnungen für ${targetUser.tag}`)
                .setColor('#FFB7C5')
                .setTimestamp();

            let desc = `Gesamt: **${history.length}**\n\n`;
            history.forEach((w, i) => desc += `**#${i + 1}** (${w.date}): ${w.reason} (Von: ${w.moderator})\n`);
            embed.setDescription(desc);
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // ================= REMOVE =================
        if (sub === 'remove') {
            const num = interaction.options.getInteger('nummer') - 1;
            if (num < 0 || num >= history.length) return await interaction.reply({ content: '❌ Ungültige Nummer.', ephemeral: true });

            history.splice(num, 1);
            if (history.length === 0) await db.delete(dbKey); else await db.set(dbKey, history);

            return await interaction.reply({ content: `✅ Verwarnung #${num + 1} gelöscht.`, ephemeral: true });
        }

        // ================= CLEAR =================
        if (sub === 'clear') {
            await db.delete(dbKey);
            return await interaction.reply({ content: `🧹 Alle Verwarnungen für ${targetUser.tag} wurden gelöscht.`, ephemeral: true });
        }
    }
};