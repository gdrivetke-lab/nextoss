const Datastore = require('nedb-promises');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../../data');

const collections = {
  users: Datastore.create({ filename: path.join(DATA_DIR, 'users.db'), autoload: true }),
  messages: Datastore.create({ filename: path.join(DATA_DIR, 'messages.db'), autoload: true }),
  rooms: Datastore.create({ filename: path.join(DATA_DIR, 'rooms.db'), autoload: true }),
  groups: Datastore.create({ filename: path.join(DATA_DIR, 'groups.db'), autoload: true }),
  reports: Datastore.create({ filename: path.join(DATA_DIR, 'reports.db'), autoload: true }),
  subscriptions: Datastore.create({ filename: path.join(DATA_DIR, 'subscriptions.db'), autoload: true }),
  userSubscriptions: Datastore.create({ filename: path.join(DATA_DIR, 'userSubscriptions.db'), autoload: true }),
  notifications: Datastore.create({ filename: path.join(DATA_DIR, 'notifications.db'), autoload: true }),
  voiceChannels: Datastore.create({ filename: path.join(DATA_DIR, 'voiceChannels.db'), autoload: true }),
};

module.exports = collections;
