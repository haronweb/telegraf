# Telegraf v4.16.3 — Custom Fork

Custom fork of [Telegraf](https://github.com/telegraf/telegraf) v4.16.3 with 3 patched methods and v3-compat shims.

## Custom Methods

### `ctx.replyOrEdit(...args)`
Auto `editMessageText` on callback_query, `reply` on regular message.

```js
bot.action('menu', (ctx) => {
  ctx.replyOrEdit('Hello!', { parse_mode: 'HTML' });
});
```

### `ctx.scene.reply(text, options)`
Smart reply for scenes — edits previous message, deletes user input, tracks `_last_msg_id`.

- If callback_query and stored `_last_msg_id` differ — deletes the old message
- Always prefers callback message over stale `_last_msg_id`
- Falls back to `replyWithHTML` if edit fails
- Supports `noEdit` option to force a new message

```js
ctx.scene.reply('Step 1', {
  reply_markup: Markup.inlineKeyboard([...]),
});
```

### `ctx.wizard.prevStep()` / `nextStep()` / `chooseStep(n)`
Navigate wizard steps with auto-execution.

```js
ctx.wizard.nextStep();   // go forward
ctx.wizard.prevStep();   // go back
ctx.wizard.chooseStep(3); // jump to step 3
```

## V3-Compat Shims

Old v3 import paths work:

```js
const WizardScene = require('telegraf/scenes/wizard'); // → Scenes.WizardScene
const Stage = require('telegraf/stage');                // → Scenes.Stage
const session = require('telegraf/session');             // → session function
```

## Patches

- **Markup.inlineKeyboard()** — dual-compat: returns `{ inline_keyboard: [...] }` with non-enumerable `.reply_markup` getter (works with both `reply_markup: kb` and `kb.reply_markup`)
- **answerCbQuery** — accepts v3 boolean: `answerCbQuery(text, true)` → `{ show_alert: true }`

## Based on

[Telegraf v4.16.3](https://github.com/telegraf/telegraf/tree/v4.16.3) — Telegram Bot API 7.1
