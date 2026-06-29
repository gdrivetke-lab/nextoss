const db = require('../database');

const Room = {
  create: (data) => {
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    return db.rooms.insert(doc);
  },

  findById: (id) => db.rooms.findOne({ _id: id }),

  findOne: (query) => db.rooms.findOne(query),

  find: (query = {}, options = {}) => {
    let cursor = db.rooms.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor;
  },

  count: (query = {}) => db.rooms.count(query),

  update: (query, update) => db.rooms.update(query, update, { multi: true }),

  findByIdAndUpdate: async (id, update) => {
    await db.rooms.update({ _id: id }, update);
    return db.rooms.findOne({ _id: id });
  },

  findByIdAndDelete: (id) => db.rooms.remove({ _id: id }, {}),
};

module.exports = Room;
