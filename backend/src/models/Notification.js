const db = require('../database');

const Notification = {
  create: (data) => {
    const doc = { ...data, createdAt: new Date(), read: false, delivered: false };
    return db.notifications.insert(doc);
  },

  findById: (id) => db.notifications.findOne({ _id: id }),

  find: (query = {}, options = {}) => {
    let cursor = db.notifications.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);
    return cursor;
  },

  count: (query = {}) => db.notifications.count(query),

  updateMany: (query, update) => db.notifications.update(query, update, { multi: true }),
};

module.exports = Notification;
