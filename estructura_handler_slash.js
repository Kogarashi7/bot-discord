const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(' ') //Nombre del comando
        .setDescription(' ') //Descripción del comando
        .addUserOption(option =>
            option.setName(' ') //Nombre de la opción
                .setDescription(' ') //Descripción de la opción
                .setRequired(true))
        .addStringOption(option =>
            option.setName(' ') //Nombre de la opción
                .setDescription(' ') //Descripción de la opción
                .setRequired(false)),
    async execute(interaction) {

        // Logica del comando
        await interaction.reply(' '); // Respuesta al comando

        

}};