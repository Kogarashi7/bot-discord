const fs = require('fs');
const path = require('path');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');

const categoryIcons = {
  moderacion: '🛠️',
  diversion: '🎉',
  utilidades: '📎',
  musica: '🎵',
  info: 'ℹ️',
  economia: '💰',
  juegos: '🎮',
};

const categoryDescriptions = {
  moderacion: 'Herramientas para mantener el orden.',
  diversion: 'Comandos divertidos para tu servidor.',
  utilidades: 'Utilidades prácticas para todos.',
  musica: '¡Reproduce música sin parar!',
  info: 'Obtén información relevante.',
  economia: 'Sistemas de monedas y tienda.',
  juegos: 'Juega y pasa el rato.',
};

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`❌ Error en /${interaction.commandName}:`, error);
        const reply = { content: '❌ Hubo un error al ejecutar el comando.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'help_select_category') {
      const selected = interaction.values[0];
      const slashPath = path.join(__dirname, '../commands/slash');
      const categories = fs.readdirSync(slashPath).filter(folder =>
        fs.lstatSync(path.join(slashPath, folder)).isDirectory()
      );

      if (selected === 'categorias') {
        const embed = new EmbedBuilder()
          .setTitle('📖 Comandos de Izumi')
          .addFields(
            { name: '» Menú de ayuda', value: `Tengo **${categories.length}** categorías disponibles.` },
            { name: '» Categorías', value: 'Usa el menú desplegable para ver los comandos por categoría.' }
          )
          .setFooter({ text: 'Selecciona una categoría del menú para comenzar.' })
          .setColor('#3fe0e2');

        const selectMenu = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('help_select_category')
            .setPlaceholder('📂 Elige una categoría')
            .addOptions([
              {
                label: 'Categorías',
                description: 'Mira la lista de categorías',
                value: 'categorias',
                emoji: '📖',
                default: true
              },
              ...categories.map(cat => ({
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                description: categoryDescriptions[cat] || 'Comandos de esta categoría',
                value: cat,
                emoji: categoryIcons[cat] || '📁',
              }))
            ])
        );

        const cancelButton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('help_cancel')
            .setLabel('❌ Cancelar')
            .setStyle(ButtonStyle.Danger)
        );

        await interaction.update({
          embeds: [embed],
          components: [selectMenu, cancelButton],
        });
        return;
      }

      // Mostrar comandos de la categoría
      const category = selected;
      const commandsPath = path.join(__dirname, `../commands/slash/${category}`);
      if (!fs.existsSync(commandsPath)) return;

      const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
      const commandList = [];

      for (const file of files) {
        try {
          const command = require(path.join(commandsPath, file));
          if (!command?.data?.name || !command?.data?.description) continue;

          const registered = client.application.commands.cache.find(c => c.name === command.data.name);
          const mention = registered ? `</${command.data.name}:${registered.id}>` : `\`/${command.data.name}\``;
          commandList.push(`${mention} - ${command.data.description}`);
        } catch (err) {
          console.error(`Error cargando comando ${file}:`, err);
        }
      }

      const totalPages = Math.ceil(commandList.length / 15);
      const page = 0;
      const paginated = commandList.slice(page * 15, page * 15 + 15);

      const embed = new EmbedBuilder()
        .setTitle(`📁 Comandos de ${category.charAt(0).toUpperCase() + category.slice(1)}`)
        .setDescription(paginated.join('\n\n') || 'No hay comandos en esta categoría.')
        .setFooter({ text: `Página ${page + 1} de ${totalPages}` })
        .setColor('#3fe0e2');

      const selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_select_category')
          .setPlaceholder('📂 Cambiar categoría')
          .addOptions([
            {
              label: 'Categorías',
              description: 'Volver a la lista de categorías',
              value: 'categorias',
              emoji: '📖',
            },
            ...categories.map(cat => ({
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
              value: cat,
              description: categoryDescriptions[cat] || 'Comandos de esta categoría',
              emoji: categoryIcons[cat] || '📁',
            }))
          ])
      );

      const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`help_prev_${category}_${page}`)
          .setLabel('⏪ Anterior')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`help_next_${category}_${page}`)
          .setLabel('⏩ Siguiente')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(totalPages <= 1),
        new ButtonBuilder()
          .setCustomId('help_cancel')
          .setLabel('❌ Cancelar')
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.update({
        embeds: [embed],
        components: [selectMenu, paginationRow],
      });
    }

    // Paginación y cancelar
    if (interaction.isButton() && interaction.customId.startsWith('help_')) {
      if (interaction.customId === 'help_cancel') {
        await interaction.update({ content: '❌ Menú cerrado.', components: [], embeds: [] });
        return;
      }

      const [_, action, category, pageStr] = interaction.customId.split('_');
      const page = parseInt(pageStr);
      const newPage = action === 'next' ? page + 1 : page - 1;

      const commandsPath = path.join(__dirname, `../commands/slash/${category}`);
      if (!fs.existsSync(commandsPath)) return;

      const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
      const commandList = [];

      for (const file of files) {
        try {
          const command = require(path.join(commandsPath, file));
          if (!command?.data?.name || !command?.data?.description) continue;

          const registered = client.application.commands.cache.find(c => c.name === command.data.name);
          const mention = registered ? `</${command.data.name}:${registered.id}>` : `\`/${command.data.name}\``;
          commandList.push(`${mention} - ${command.data.description}`);
        } catch (err) {
          console.error(`Error cargando comando ${file}:`, err);
        }
      }

      const totalPages = Math.ceil(commandList.length / 15);
      const paginated = commandList.slice(newPage * 15, newPage * 15 + 15);

      const embed = new EmbedBuilder()
        .setTitle(`📁 Comandos de ${category.charAt(0).toUpperCase() + category.slice(1)}`)
        .setDescription(paginated.join('\n\n') || 'No hay comandos.')
        .setFooter({ text: `Página ${newPage + 1} de ${totalPages}` })
        .setColor('#3fe0e2');

      const categories = fs.readdirSync(path.join(__dirname, '../commands/slash')).filter(folder =>
        fs.lstatSync(path.join(__dirname, '../commands/slash', folder)).isDirectory()
      );

      const selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('help_select_category')
          .setPlaceholder('📂 Cambiar categoría')
          .addOptions([
            {
              label: 'Categorías',
              description: 'Volver a la lista de categorías',
              value: 'categorias',
              emoji: '📖',
            },
            ...categories.map(cat => ({
              label: cat.charAt(0).toUpperCase() + cat.slice(1),
              value: cat,
              description: categoryDescriptions[cat] || 'Comandos de esta categoría',
              emoji: categoryIcons[cat] || '📁',
            }))
          ])
      );

      const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help_cancel')
          .setLabel('❌ Cancelar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`help_prev_${category}_${newPage}`)
          .setLabel('⏪ Anterior')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(newPage === 0),
        new ButtonBuilder()
          .setCustomId(`help_next_${category}_${newPage}`)
          .setLabel('⏩ Siguiente')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(newPage >= totalPages - 1),
        
      );

      await interaction.update({
        embeds: [embed],
        components: [selectMenu, paginationRow],
      });
    }
  }
};
