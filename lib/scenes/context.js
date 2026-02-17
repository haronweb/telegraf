"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const composer_1 = __importDefault(require("../composer"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('telegraf:scenes:context');
const noop = () => Promise.resolve();
const now = () => Math.floor(Date.now() / 1000);
class SceneContextScene {
    constructor(ctx, scenes, options) {
        this.ctx = ctx;
        this.scenes = scenes;
        this.leaving = false;
        // @ts-expect-error {} might not be assignable to D
        const fallbackSessionDefault = {};
        this.options = { defaultSession: fallbackSessionDefault, ...options };
    }
    get session() {
        var _a, _b;
        const defaultSession = Object.assign({}, this.options.defaultSession);
        let session = (_b = (_a = this.ctx.session) === null || _a === void 0 ? void 0 : _a.__scenes) !== null && _b !== void 0 ? _b : defaultSession;
        if (session.expires !== undefined && session.expires < now()) {
            session = defaultSession;
        }
        if (this.ctx.session === undefined) {
            this.ctx.session = { __scenes: session };
        }
        else {
            this.ctx.session.__scenes = session;
        }
        return session;
    }
    get state() {
        var _a;
        var _b;
        return ((_a = (_b = this.session).state) !== null && _a !== void 0 ? _a : (_b.state = {}));
    }
    set state(value) {
        this.session.state = { ...value };
    }
    get current() {
        var _a;
        const sceneId = (_a = this.session.current) !== null && _a !== void 0 ? _a : this.options.default;
        return sceneId === undefined || !this.scenes.has(sceneId)
            ? undefined
            : this.scenes.get(sceneId);
    }
    reset() {
        if (this.ctx.session !== undefined)
            this.ctx.session.__scenes = Object.assign({}, this.options.defaultSession);
    }
    async enter(sceneId, initialState = {}, silent = false) {
        var _a, _b;
        if (!this.scenes.has(sceneId)) {
            throw new Error(`Can't find scene: ${sceneId}`);
        }
        if (!silent) {
            await this.leave();
        }
        debug('Entering scene', sceneId, initialState, silent);
        this.session.current = sceneId;
        this.state = initialState;
        const ttl = (_b = (_a = this.current) === null || _a === void 0 ? void 0 : _a.ttl) !== null && _b !== void 0 ? _b : this.options.ttl;
        if (ttl !== undefined) {
            this.session.expires = now() + ttl;
        }
        if (this.current === undefined || silent) {
            return;
        }
        const handler = 'enterMiddleware' in this.current &&
            typeof this.current.enterMiddleware === 'function'
            ? this.current.enterMiddleware()
            : this.current.middleware();
        return await handler(this.ctx, noop);
    }
    reenter() {
        return this.session.current === undefined
            ? undefined
            : this.enter(this.session.current, this.state);
    }
    async leave() {
        if (this.leaving)
            return;
        debug('Leaving scene');
        try {
            this.leaving = true;
            if (this.current === undefined) {
                return;
            }
            const handler = 'leaveMiddleware' in this.current &&
                typeof this.current.leaveMiddleware === 'function'
                ? this.current.leaveMiddleware()
                : composer_1.default.passThru();
            await handler(this.ctx, noop);
            return this.reset();
        }
        finally {
            this.leaving = false;
        }
    }
    /**
     * Custom: smart reply - edits previous message, deletes user input, tracks _last_msg_id
     */
    async reply(...args) {
        const chatId = this.ctx.chat.id;
        let lastMsgId = this.state._last_msg_id;
        const text = args[0];
        const options = { parse_mode: 'HTML', ...args[1] };
        const noEdit = options.noEdit;
        delete options.noEdit;
        const replyToId = this.ctx.callbackQuery?.message?.message_id || this.ctx.message?.message_id;
        // Always prefer callback message over stale _last_msg_id
        if (!noEdit && this.ctx.callbackQuery?.message?.message_id) {
            lastMsgId = this.ctx.callbackQuery.message.message_id;
            this.state._last_msg_id = lastMsgId;
        } else if (!noEdit && !lastMsgId) {
            // no callback, no stored id — will send new message
        }
        if (this.ctx.message?.message_id && !this.ctx.message?.media_group_id) {
            await this.ctx.telegram.deleteMessage(chatId, this.ctx.message.message_id).catch(() => { });
        }
        if (lastMsgId && !noEdit) {
            try {
                return await this.ctx.telegram.editMessageText(chatId, lastMsgId, null, text, options);
            }
            catch (err) {
                if (err.description?.includes('message is not modified'))
                    return;
                await this.ctx.telegram.deleteMessage(chatId, lastMsgId).catch(() => { });
            }
        }
        const msg = await this.ctx.replyWithHTML(text, {
            ...options,
            reply_to_message_id: noEdit ? replyToId : undefined,
        });
        this.state._last_msg_id = msg.message_id;
        return msg;
    }
}
exports.default = SceneContextScene;
