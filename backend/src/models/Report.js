const db = require('../database');

const Report = {
  create: (data) => {
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    return db.reports.insert(doc);
  },

  findById: (id) => db.reports.findOne({ _id: id }),

  find: (query = {}, options = {}) => {
    let cursor = db.reports.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor;
  },

  count: (query = {}) => db.reports.count(query),

  findByIdAndUpdate: async (id, update) => {
    await db.reports.update({ _id: id }, update);
    return db.reports.findOne({ _id: id });
  },
};

module.exports = Report;
