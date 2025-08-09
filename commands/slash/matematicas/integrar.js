const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const xml2js = require('xml2js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('integrar')
    .setDescription('Resuelve una integral con pasos.')
    .addStringOption(option =>
      option.setName('expresion')
        .setDescription('Escribe la integral, por ejemplo: integral x^2 dx')
        .setRequired(true)
    ),

  async execute(interaction) {
    const expresion = interaction.options.getString('expresion');
    const appId = 'RR8A57-59YRYYQR87'; // ← Reemplaza esto por tu App ID

    await interaction.deferReply();

    try {
      const res = await axios.get('http://api.wolframalpha.com/v2/query', {
        params: {
          input: `integrate ${expresion}`,
          appid: appId,
          output: 'XML',
          podstate: 'Step-by-step solution',
        },
      });

      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(res.data);

      const pods = result.queryresult.pod || [];

      const stepPod = pods.find(pod => pod.$.title.toLowerCase().includes('step-by-step'));
      const answerPod = pods.find(pod => pod.$.title.toLowerCase().includes('indefinite integral'));

      let steps = '❌ No se pudieron obtener los pasos.';
      let answer = '❌ No se encontró el resultado.';

      if (stepPod && stepPod.subpod?.[0]?.plaintext?.[0]) {
        steps = stepPod.subpod[0].plaintext[0];
      }

      if (answerPod && answerPod.subpod?.[0]?.plaintext?.[0]) {
        answer = answerPod.subpod[0].plaintext[0];
      }

      const embed = new EmbedBuilder()
        .setTitle('🧮 Resultado de la integral')
        .addFields(
          { name: '📌 Entrada', value: `\`${expresion}\`` },
          { name: '✅ Resultado', value: `\`${answer}\`` },
        )
        .setColor('Random')
        .setFooter({ text: 'Powered by Wolfram Alpha' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error al consultar Wolfram:', error);
      await interaction.editReply({
        content: '❌ Hubo un error al consultar la integral. Intenta más tarde.'
      });
    }
  }
};
