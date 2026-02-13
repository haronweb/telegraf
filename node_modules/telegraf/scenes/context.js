const debug = require('debug')('telegraf:scenes:context')
const { safePassThru } = require('../composer')

const noop = () => Promise.resolve()
const now = () => Math.floor(Date.now() / 1000)

class SceneContext {
  constructor (ctx, scenes, options) {
    this.ctx = ctx
    this.scenes = scenes
    this.options = options
  }

  get session () {
    const sessionName = this.options.sessionName
    let session = this.ctx[sessionName].__scenes || {}
    if (session.expires < now()) {
      session = {}
    }
    this.ctx[sessionName].__scenes = session
    return session
  }

  get state () {
    this.session.state = this.session.state || {}
    return this.session.state
  }

  set state (value) {
    this.session.state = { ...value }
  }

  get current () {
    const sceneId = this.session.current || this.options.default
    return (sceneId && this.scenes.has(sceneId)) ? this.scenes.get(sceneId) : null
  }

  reset () {
    const sessionName = this.options.sessionName
    delete this.ctx[sessionName].__scenes
  }

  enter (sceneId, initialState, silent) {
    if (!sceneId || !this.scenes.has(sceneId)) {
      throw new Error(`Can't find scene: ${sceneId}`)
    }
    const leave = silent ? noop() : this.leave()
    return leave.then(() => {
      debug('Enter scene', sceneId, initialState, silent)
      this.session.current = sceneId
      this.state = initialState
      const ttl = this.current.ttl || this.options.ttl
      if (ttl) {
        this.session.expires = now() + ttl
      }
      if (silent) {
        return Promise.resolve()
      }
      const handler = typeof this.current.enterMiddleware === 'function'
        ? this.current.enterMiddleware()
        : this.current.middleware()
      return handler(this.ctx, noop)
    })
  }

  reenter () {
    return this.enter(this.session.current, this.state)
  }

  leave () {
    debug('Leave scene')
    const handler = this.current && this.current.leaveMiddleware
      ? this.current.leaveMiddleware()
      : safePassThru()
    return handler(this.ctx, noop).then(() => this.reset())
  }

async reply(...args) {
  const chatId = this.ctx.chat.id;
  let lastMsgId = this.state._last_msg_id;
  const text = args[0];
  const options = { parse_mode: 'HTML', ...args[1] };
  const noEdit = options.noEdit;
  delete options.noEdit;

  // Получаем ID для реплая
  const replyToId = this.ctx.callbackQuery?.message?.message_id || this.ctx.message?.message_id;

  // Берём ID сообщения из callback_query (кнопка, на которую нажали)
  if (!noEdit && this.ctx.callbackQuery?.message?.message_id) {
    const cbMsgId = this.ctx.callbackQuery.message.message_id;
    // Если tracked message отличается от нажатого — удаляем старое
    if (lastMsgId && lastMsgId !== cbMsgId) {
      await this.ctx.telegram.deleteMessage(chatId, lastMsgId).catch(() => {});
    }
    lastMsgId = cbMsgId;
    this.state._last_msg_id = lastMsgId;
  }

  // Удаляем сообщение пользователя (если это текст/фото)
  if (this.ctx.message?.message_id) {
    await this.ctx.telegram.deleteMessage(chatId, this.ctx.message.message_id).catch(() => {});
  }

  // Пробуем edit (если не noEdit или уже есть _last_msg_id)
  if (lastMsgId && !noEdit) {
    try {
      return await this.ctx.telegram.editMessageText(chatId, lastMsgId, null, text, options);
    } catch (err) {
      if (err.description?.includes('message is not modified')) return;
      await this.ctx.telegram.deleteMessage(chatId, lastMsgId).catch(() => {});
    }
  }

  // Отправляем новое с реплаем
  const msg = await this.ctx.replyWithHTML(text, {
    ...options,
    reply_to_message_id: noEdit ? replyToId : undefined,
  });
  this.state._last_msg_id = msg.message_id;
  return msg;
}
}

module.exports = SceneContext
