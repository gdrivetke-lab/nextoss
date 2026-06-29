const db = require('../database');

const Message = {
  create: (data) => {
    const doc = { ...data, createdAt: new Date(), reactions: [], readBy: [] };
    return db.messages.insert(doc);
  },

  findById: (id) => db.messages.findOne({ _id: id }),

  findOne: (query) => db.messages.findOne(query),

  find: (query = {}, options = {}) => {
    let cursor = db.messages.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor;
  },

  count: (query = {}) => db.messages.count(query),

  update: (query, update) => db.messages.update(query, update, { multi: true }),

  updateMany: (query, update) => db.messages.update(query, update, { multi: true }),

  findByIdAndUpdate: async (id, update) => {
    await db.messages.update({ _id: id }, update);
    return db.messages.findOne({ _id: id });
  },

  deleteMany: (query) => db.messages.remove(query, { multi: true }),
};

module.exports = Message;
