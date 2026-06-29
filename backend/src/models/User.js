const db = require('../database');
const bcrypt = require('bcryptjs');

const User = {
  create: async (data) => {
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    if (doc.password) doc.password = await bcrypt.hash(doc.password, 12);
    return db.users.insert(doc);
  },

  findById: async (id) => db.users.findOne({ _id: id }),

  findOne: async (query) => db.users.findOne(query),

  find: async (query = {}, options = {}) => {
    let cursor = db.users.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor;
  },

  count: async (query = {}) => db.users.count(query),

  update: async (query, update) => {
    const set = update.$set || update;
    set.updatedAt = new Date();
    return db.users.update(query, { $set: set }, { multi: true });
  },

  findByIdAndUpdate: async (id, update) => {
    const set = update.$set || update;
    set.updatedAt = new Date();
    await db.users.update({ _id: id }, { $set: set });
    return db.users.findOne({ _id: id });
  },

  comparePassword: async (user, candidate) => {
    if (!user.password) return false;
    return bcrypt.compare(candidate, user.password);
  },

  toPublicJSON: (user) => {
    if (!user) return null;
    const data = { ...user };
    delete data.password;
    return data;
  },
};

module.exports = User;
