const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAccountByRiotId, getSummonerByPuuid, getRankedData } = require('../../../utils/riotApi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Muestra el perfil de un jugador de League of Legends.')
    .addStringOption(option =>
      option.setName('riotid')
        .setDescription('Ejemplo: Faker#KR1')
        .setRequired(true)
    ),

  async execute(interaction) {
    const riotId = interaction.options.getString('riotid');
    const [gameName, tagLine] = riotId.split('#');
    if (!gameName || !tagLine) {
      return interaction.reply({ content: '❌ Formato incorrecto. Usa el formato `nombre#tag`, por ejemplo: `Faker#KR1`', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      const account = await getAccountByRiotId(gameName, tagLine);
      const summoner = await getSummonerByPuuid(account.puuid);
      const ranked = await getRankedData(summoner.id);

      const solo = ranked.find(q => q.queueType === 'RANKED_SOLO_5x5');
      const flex = ranked.find(q => q.queueType === 'RANKED_FLEX_SR');

      const embed = new EmbedBuilder()
        .setTitle(`Perfil de ${summoner.name}`)
        .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.13.1/img/profileicon/${summoner.profileIconId}.png`)
        .addFields(
          { name: 'Nivel', value: `${summoner.summonerLevel}`, inline: true },
          solo ? {
            name: 'Solo/Duo',
            value: `${solo.tier} ${solo.rank} (${solo.leaguePoints} LP)\n${solo.wins}V / ${solo.losses}D (${getWinrate(solo)}% WR)`,
            inline: true
          } : { name: 'Solo/Duo', value: 'Sin clasificatoria', inline: true },
          flex ? {
            name: 'Flexible',
            value: `${flex.tier} ${flex.rank} (${flex.leaguePoints} LP)\n${flex.wins}V / ${flex.losses}D (${getWinrate(flex)}% WR)`,
            inline: true
          } : { name: 'Flexible', value: 'Sin clasificatoria', inline: true }
        )
        .setColor(0x00AE86)
        .setFooter({ text: 'Datos de Riot API' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ No se pudo obtener el perfil. Verifica que el Riot ID sea correcto y que tu API key esté activa.');
    }
  }
};

function getWinrate(queue) {
  const total = queue.wins + queue.losses;
  return total ? Math.round((queue.wins / total) * 100) : 0;
}
