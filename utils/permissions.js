const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

class PermissionManager {
  static isOwner(userId) {
    return config.owners.includes(userId);
  }

  static hasPermission(member, permission) {
    return member.permissions.has(permission);
  }

  static isModerator(member) {
    return member.permissions.has(PermissionFlagsBits.KickMembers) ||
           member.permissions.has(PermissionFlagsBits.BanMembers) ||
           member.permissions.has(PermissionFlagsBits.ModerateMembers);
  }

  static isAdmin(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator) ||
           this.isOwner(member.id);
  }

  static hierarchyCheck(member, targetMember) {
    return member.roles.highest.position > targetMember.roles.highest.position;
  }

  static async ensurePermissions(interaction, permissions, action) {
    if (!interaction.member.permissions.has(permissions)) {
      await interaction.reply({
        embeds: [require('./embedBuilder').SakuraEmbed.error(
          'Fehlende Berechtigungen',
          `Du benötigst folgende Berechtigung: \`${permissions}\``
        )],
        ephemeral: true
      });
      return false;
    }
    return true;
  }
}

module.exports = PermissionManager;
