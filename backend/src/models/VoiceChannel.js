const db = require('../database');

const VoiceChannel = {
  create: (data) => {
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    return db.voiceChannels.insert(doc);
  },

  findById: (id) => db.voiceChannels.findOne({ _id: id }),

  find: (query = {}, options = {}) => {
    let cursor = db.voiceChannels.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    return cursor;
  },

  findByIdAndUpdate: async (id, update) => {
    await db.voiceChannels.update({ _id: id }, update);
    return db.voiceChannels.findOne({ _id: id });
  },
};

module.exports = VoiceChannel;
