const mongoose = require('mongoose');

const rescueScript = new mongoose.Schema({
  guildID: { type: String, required: true },
  cstRoleID: { type: String, required: true },
  ambRoleID: { type: String, required: true },
  firRoleID: { type: String, required: true },
  reqChannelID: { type: String, required: true },
  categoryID: { type: String, required: true },
  logChannelID: { type: String, required: true },
  supRoleID: { type: String, required: true }
});

module.exports = mongoose.model('rescue_settings', rescueScript);