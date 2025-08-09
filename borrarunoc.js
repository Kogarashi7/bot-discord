require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Cambia esto por el nombre exacto del comando que quieres borrar
const commandNameToDelete = 'ban';

(async () => {
  try {
    console.log(`🔍 Buscando comando "${commandNameToDelete}"...`);

    const commands = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    );

    const command = commands.find(cmd => cmd.name === commandNameToDelete);

    if (!command) {
      return console.log(`❌ Comando "${commandNameToDelete}" no encontrado.`);
    }

    await rest.delete(
      Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, command.id)
    );

    console.log(`✅ Comando "${commandNameToDelete}" eliminado del servidor.`);
  } catch (error) {
    console.error('❌ Error eliminando el comando:', error);
  }
})();
