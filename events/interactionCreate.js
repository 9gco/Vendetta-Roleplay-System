const CommandHandler = require('../handlers/commandHandler');
const { SakuraEmbed } = require('../utils/embedBuilder');
const config = require('../config.json');
const Logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      Logger.command(`/${interaction.commandName}`, interaction.user.tag, interaction.guild?.name || 'DM');
      await CommandHandler.handleSlash(interaction, client);
    }

    else if (interaction.isButton()) {
      await handleButton(interaction, client);
    }

    else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction, client);
    }

    else if (interaction.isModalSubmit()) {
      await handleModal(interaction, client);
    }
  },
};

async function handleButton(interaction, client) {
  const { customId } = interaction;

  switch (customId) {
    case 'delete_ticket':
      await interaction.reply({
        embeds: [SakuraEmbed.info('Ticket wird geschlossen', 'Dieses Ticket wird in 5 Sekunden geschlossen...')],
        ephemeral: true
      });
      setTimeout(() => interaction.channel?.delete().catch(() => {}), 5000);
      break;

    case 'claim_ticket':
      await interaction.reply({
        embeds: [SakuraEmbed.success('Ticket übernommen', `${interaction.user} hat sich diesem Ticket angenommen.`)],
        ephemeral: false
      });
      break;

    default:
      if (customId.startsWith('role_')) {
        const roleId = customId.replace('role_', '');
        const role = interaction.guild?.roles.cache.get(roleId);
        if (!role) return;

        const member = interaction.member;
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(role);
          await interaction.reply({ content: `❌ Rolle ${role.name} entfernt.`, ephemeral: true });
        } else {
          await member.roles.add(role);
          await interaction.reply({ content: `✅ Rolle ${role.name} hinzugefügt.`, ephemeral: true });
        }
      }
      break;
  }
}

async function handleSelectMenu(interaction, client) {
  const { customId, values } = interaction;

  if (customId === 'help_categories') {
    const category = values[0];
    const commands = client.slashCommands.filter(cmd => cmd.category === category);

    const embed = SakuraEmbed.custom({
      title: `${config.emojis.ribbon} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      description: commands.map(cmd => `**/${cmd.name}** – ${cmd.description || 'Keine Beschreibung'}`).join('\n'),
      color: config.colors.secondary,
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

async function handleModal(interaction, client) {
  const { customId } = interaction;

  if (customId === 'ticket_modal') {
    const reason = interaction.fields.getTextInputValue('ticket_reason');
    const category = interaction.fields.getTextInputValue('ticket_category');

    await interaction.reply({
      embeds: [SakuraEmbed.success('Ticket erstellt', `Kategorie: ${category}\nGrund: ${reason}\n\nEin Teammitglied wird sich bald um dich kümmern.`)],
      ephemeral: true
    });

    const channel = interaction.guild?.channels.cache.find(c => c.name.includes('tickets'));
    if (channel) {
      channel.send({
        embeds: [SakuraEmbed.custom({
          title: `${config.emojis.ticket} Neues Ticket`,
          description: `**Von:** ${interaction.user.tag}\n**Kategorie:** ${category}\n**Grund:** ${reason}`,
          color: config.colors.primary,
        })]
      });
    }
  }
}
