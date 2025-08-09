// utils/logger.js
module.exports = async (client, logChannelId, embed) => {
  const channel = await client.channels.fetch(logChannelId);
  if (channel && channel.isTextBased()) {
    channel.send({ embeds: [embed] });
  }
};
