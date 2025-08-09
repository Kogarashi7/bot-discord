require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('⛔ Borrando todos los slash commands del servidor de pruebas...');

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [] } // Vacío para eliminar
    );

    console.log('✅ Todos los comandos fueron eliminados del servidor.');
  } catch (error) {
    console.error('❌ Error al borrar los comandos:', error);
  }
})();
