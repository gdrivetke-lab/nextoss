const db = require('../database');

const Subscription = {
  create: (data) => {
    const doc = { ...data, createdAt: new Date() };
    return db.subscriptions.insert(doc);
  },

  find: (query = {}, options = {}) => {
    let cursor = db.subscriptions.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    return cursor;
  },

  findById: (id) => db.subscriptions.findOne({ _id: id }),
};

const UserSubscription = {
  create: (data) => {
    const doc = { ...data, createdAt: new Date() };
    return db.userSubscriptions.insert(doc);
  },

  findOne: (query) => db.userSubscriptions.findOne(query),

  find: (query = {}, options = {}) => {
    let cursor = db.userSubscriptions.find(query);
    if (options.sort) cursor = cursor.sort(options.sort);
    return cursor;
  },

  updateMany: (query, update) => db.userSubscriptions.update(query, update, { multi: true }),
};

module.exports = { Subscription, UserSubscription };
