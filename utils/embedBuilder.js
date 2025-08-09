// utils/embedBuilder.js
const { EmbedBuilder } = require('discord.js');

module.exports = ({ title, description, color = 'Blue', footer, timestamp = true }) => {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color);
  
  if (footer) embed.setFooter({ text: footer });
  if (timestamp) embed.setTimestamp();

  return embed;
};
