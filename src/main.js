import express from 'express'
import bodyParser from 'body-parser'
import MessageHandler from './MessageHandler'
import Translator from './Translator'
import SQLite from './SQLite'

const persister = new SQLite(process.env.SQLITE_FILEPATH)
const translator = new Translator(persister)
const messageHandler = new MessageHandler(translator)
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/lang', async function (req, res) {
    const { user_id, text} = req.body

    try {
        let msg

        const lang = await translator.setLang(user_id, text)

        if (lang) {
            msg = `:white_check_mark: Translation service *enabled*. Your messages will now be translated into *${lang}*.`
        } else {
            msg = ":no_entry_sign: Translation service *disabled*. Your messages will not be translated."
        }

        return res.send(msg)
    } catch (e) {
        return res.send(e.message)
    }
})

app.post('/events', async function (req, res) {
    const { type, token } = req.body

    // Verify that the request is from Slack
    if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        console.warn(`Invalid token '${token}' sent to server by ${clientIp}.`)
        res.status(401).send("Invalid token. I do not believe you are from Slack.")
    }

    if (type === "url_verification") {
        res.send({ challenge: req.body.challenge })
    } else if (type === "event_callback") {
        res.status(200).send()

        if (req.body.event.type === "message") {
            try {
                await messageHandler.handle(req.body.event)
            } catch (e) {
                console.error(e)
            }
        }
    }
})

const checkConfig = () => {
    let missingVars = false

    const requiredEnvVars = [
        "SLACK_VERIFICATION_TOKEN",
        "SLACK_API_TOKEN",
        "SQLITE_FILEPATH"
    ]

    requiredEnvVars.forEach((envVar) => {
        if (!process.env[envVar]) {
            console.error(`Required environment variable '${envVar}' is not defined.`)
            missingVars = true
        }
    })

    if (missingVars) {
        throw new Error("Required environment variables not defined.")
    }
}

const main = async () => {

    try {
        // Check all required config variables are defined
        checkConfig()

        // Initialize the database
        await persister.initialize()

        // Start the express server
        app.listen(process.env.PORT || 4000)
    } catch (e) {
        console.error(e)
    }
}

main()
