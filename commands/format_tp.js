const { Markup } = require('telegraf')
const { User } = require('../database')


module.exports = async(ctx) => {
    try {
        const user = await User.findOne({where: {id: ctx.from.id}})
        
      
    await ctx.answerCbQuery("🙊 Уже открываю ").catch((err) => err);

await ctx.replyOrEdit(
    `<b>Установка ТП</b>
    
Текущий формат: ${user.smartsupp == null ? "<b>В боте</b>" : `<b>Smartsupp</b> 

Токен: <code>${user.smartsupp}</code>`} `,
    {
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
        ...(user.smartsupp == null
            ? [
                [
                Markup.callbackButton(
                    "Установить токен Smartsupp",
                    "select_smartsupp"
                ),
                ],
            ]
            : []),

        ...(user.smartsupp
            ? [
                [
                Markup.callbackButton(
                    "❌ Удалить токен Smartsupp",
                    "delete_smartsupp"
                ),
                ],
            ]
            : []),
        [Markup.callbackButton("◀️ Назад", "settings")],
        ]),
    
        }).catch((err) => err);
    } catch (err) {
        console.log(err)
        return ctx.reply('❌ Ошибка').catch((err) => err);
    }
}