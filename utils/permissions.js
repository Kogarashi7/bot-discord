
module.exports = (interaction, allowedRoles = [], allowedUsers = []) => {
  if (!interaction.member) return false;

  const hasRole = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));
  const isUserAllowed = allowedUsers.includes(interaction.user.id);

  return hasRole || isUserAllowed;
};
