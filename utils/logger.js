const moment = require('moment');
const colors = require('colors');

class Logger {
  static timestamp() {
    return moment().format('DD.MM.YYYY HH:mm:ss');
  }

  static info(message) {
    console.log(`${colors.gray(`[${this.timestamp()}]`)} ${colors.cyan('ℹ INFO')} ${message}`);
  }

  static success(message) {
    console.log(`${colors.gray(`[${this.timestamp()}]`)} ${colors.green('✔ SUCCESS')} ${message}`);
  }

  static warn(message) {
    console.log(`${colors.gray(`[${this.timestamp()}]`)} ${colors.yellow('⚠ WARN')} ${message}`);
  }

  static error(message) {
    console.log(`${colors.gray(`[${this.timestamp()}]`)} ${colors.red('✖ ERROR')} ${message}`);
  }

  static debug(message) {
    if (process.env.DEBUG) {
      console.log(`${colors.gray(`[${this.timestamp()}]`)} ${colors.magenta('🔧 DEBUG')} ${message}`);
    }
  }

  static divider() {
    console.log(colors.gray('─'.repeat(60)));
  }

  static startup(message) {
    this.divider();
    console.log(`${colors.gray(`[${this.timestamp()}]`)} ${colors.brightMagenta('🌸')} ${colors.brightCyan(message)}`);
    this.divider();
  }

  static command(cmd, user, guild) {
    console.log(
      `${colors.gray(`[${this.timestamp()}]`)} ${colors.magenta('⚡ CMD')} ` +
      `${colors.white(cmd)} ${colors.gray('von')} ${colors.cyan(user)} ${colors.gray('auf')} ${colors.yellow(guild)}`
    );
  }
}

module.exports = Logger;
