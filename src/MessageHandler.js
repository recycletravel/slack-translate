import Slack from 'slack'

const token = process.env.SLACK_API_TOKEN
const slack = new Slack({ token })

export default class MessageHandler {
    constructor(translator) {
        this.translator = translator
    }

    async handle(event) {
        let user, text, ts, attachments

        const channel = event.channel

        // If we are dealing with an edited message and the text is unchanged, exit early to prevent an infinite loop
        if (event.subtype === "message_changed" && event.message.text === event.previous_message.text) {
            return
        }

        // The structure of message_changed and regular message event objects is slightly different
        if (event.subtype === "message_changed") {
            ({ user, text, ts } = event.message)
        } else {
            ({ user, text } = event)
            ts = event.event_ts
        }

        try {
            const translation = await this.translator.translateText(user, text)

            if (!translation) {
                return
            } else {
                attachments = [{ text: translation }]
            }
        } catch (e) {
            await this.translator.setLang(user, "")
            attchText = `${e.message} Translation service disabled.`
        }

        try {
            const channel = event.channel
            return await slack.chat.update({token, channel, text, ts, attachments })
        } catch (e) {
            console.error(e)
        }
    }
}