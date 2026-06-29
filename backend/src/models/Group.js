const db = require('../database');

const Group = {
  create: (data) => {
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    return db.groups.insert(doc);
  },

  findById: (id) => db.groups.findOne({ _id: id }),

  findOne: (query) => db.groups.findOne(query),

  find: (query = {}, options = {}) => {
    let cursor = db.groups.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor;
  },

  count: (query = {}) => db.groups.count(query),

  update: (query, update) => db.groups.update(query, update, { multi: true }),

  findByIdAndUpdate: async (id, update) => {
    await db.groups.update({ _id: id }, update);
    return db.groups.findOne({ _id: id });
  },

  findByIdAndDelete: (id) => db.groups.remove({ _id: id }, {}),
};

module.exports = Group;
