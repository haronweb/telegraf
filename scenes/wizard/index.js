// v3-compat shim: require('telegraf/scenes/wizard') -> WizardScene
const { Scenes } = require('../../lib/index');
module.exports = Scenes.WizardScene;
