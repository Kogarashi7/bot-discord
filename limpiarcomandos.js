require('dotenv').config();
const { REST, Routes } = require('discord.js');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🧹 Borrando comandos globales...');
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log('✅ Comandos globales eliminados.');

    console.log('🧹 Borrando comandos de la guild de pruebas...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
    console.log(`✅ Comandos eliminados de la guild (${guildId}).`);
  } catch (error) {
    console.error('❌ Error al borrar comandos:', error);
  }
})();
