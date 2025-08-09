const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario mencionándolo')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas banear')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razón')
                .setDescription('La razón del baneo')
                .setRequired(false)),
    async execute(interaction) {
        const userToBan = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razón') || 'No especificada';

        if (!userToBan) {
            return interaction.reply({ content: '❌ Debes mencionar a un usuario para banearlo.', ephemeral: true });
        }

        try {
            const member = await interaction.guild.members.fetch(userToBan.id);
            if (!member) {
                return interaction.reply({ content: '❌ No se pudo encontrar al usuario en este servidor.', ephemeral: true });
            }

           
            

            // Baneo del usuario
            await member.ban({ reason });
            return interaction.followUp({ content: `✅ Usuario ${userToBan.tag} baneado por: ${reason}`, ephemeral: false });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ Ocurrió un error al intentar banear al usuario.', ephemeral: true });
        }
    },
};