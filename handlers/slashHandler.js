const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = async (client) => {
  client.slashCommands = new Map();
  const slashCommands = [];

  const commandFolders = fs.readdirSync(path.join(__dirname, '../commands/slash'));

  for (const folder of commandFolders) {
    const folderPath = path.join(__dirname, '../commands/slash', folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));

      if (!command?.data?.name || typeof command.execute !== 'function') {
        console.warn(`[⚠️] El comando "${file}" no es válido.`);
        continue;
      }

      client.slashCommands.set(command.data.name, command);
      slashCommands.push(command.data.toJSON());
    }
  }

  const rest = new REST({ version: '10' }).setToken(client.token);

  // 🧪 ID de tu servidor de pruebas (reemplaza si es necesario)
  const testGuildId = '1053546122087501844';

  try {
    console.log('🔁 Registrando comandos slash en guild de pruebas...');

    await rest.put(
  Routes.applicationGuildCommands(client.user.id, testGuildId),
  { body: slashCommands }
);


    console.log(`✅ Comandos registrados en la guild de pruebas (${testGuildId})`);
  } catch (error) {
    console.error('❌ Error al registrar comandos slash:', error);
  }
};
