require('dotenv').config();
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js', './client');
const fs = require('fs');
const path = require('path');



// Crear cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Colecciones para comandos
client.messageCommands = new Collection();
client.slashCommands = new Collection();

// 📥 Cargar eventos desde carpeta
client.on('messageCreate', require('./events/messageCreate'));


client.once('ready', async () => {

  // 📌 Cargar eventos
  client.events = new Collection();
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }

  // ✅ Bot listo
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // 🧾 Guardar nombres de servidores en guilds.json
  const guildData = {};
  client.guilds.cache.forEach(guild => {
    guildData[guild.id] = guild.name;
  });
  fs.writeFileSync('./guilds.json', JSON.stringify(guildData, null, 2));

  // 🏠 Mostrar comandos registrados (opcional)
  const guild = client.guilds.cache.get('1053546122087501844');
if (guild) {
  const guildCommands = await guild.commands.fetch();
  console.log(`🏠 Comandos registrados en ${guild.name}:`);
  guildCommands.forEach(cmd => {
    console.log(`- ${cmd.name}`);
  });
}

  // 🎮 Estados del bot
  const estados = [
    'preparando hechizos',
    'conjuros de sabiduría',
    'memes legendarios'
  ];
  let i = 0;
  setInterval(() => {
    const estado = estados[i];
    client.user.setActivity(estado, { type: ActivityType.Playing });
    i = (i + 1) % estados.length;
  }, 2000);

  // ✅ Cargar comandos slash (después de que el bot esté listo)
  require('./handlers/slashHandler')(client);
});



// 🔐 Iniciar sesión
if (require.main === module) {
  client.login(process.env.TOKEN);
}

const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot activo'));
app.listen(3000, () => console.log('Web activa para uptime'));


module.exports = client;
