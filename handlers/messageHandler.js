const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = '!'; // o el prefijo que uses
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command = client.messageCommands.get(cmdName);
    if (!command) return;

    try {
      await command.execute(message, args, client); // 👈 Aquí sí le pasas el client a mano
    } catch (error) {
      console.error('❌ Error al ejecutar el comando:', error);
      message.channel.send('❌ Hubo un error al ejecutar el comando.');
    }
  });
};
