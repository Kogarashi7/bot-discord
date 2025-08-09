require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

const slashCommands = [];

// Cargar comandos desde la carpeta /commands/slash
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands/slash'));

for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, 'commands/slash', folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));

    if (!command?.data?.name || typeof command.execute !== 'function') {
      console.warn(`[⚠️] Comando inválido: ${file}`);
      continue;
    }

    slashCommands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🌐 Registrando comandos slash globales...');

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: slashCommands }
    );

    console.log(`✅ ${slashCommands.length} comandos globales registrados exitosamente.`);
  } catch (error) {
    console.error('❌ Error al registrar comandos globales:', error);
  }
})();
