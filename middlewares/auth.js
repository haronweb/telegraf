const { User } = require("../database");

module.exports = async (ctx, next) => {
  try {
    // await  ctx
    // .reply("💸", {
    //   parse_mode: "HTML",
    // }).catch((err) => err);

    if (!ctx?.from) return;
    const username = ctx.from.username || ctx.from.id;
    var user = await User.findOrCreate({
      where: {
        id: ctx.from.id,
      },
      defaults: {
        id: ctx.from.id,
        username,
      },
    });
    if (user[0].username !== username)
      user[0].update({
        username,
      });
    ctx.state.user = user[0];
    
    return next();
  } catch (err) {
    console.log(err);
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
