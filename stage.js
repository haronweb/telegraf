// v3-compat shim: require('telegraf/stage') -> Stage
const { Scenes } = require('./lib/index');
module.exports = Scenes.Stage;
