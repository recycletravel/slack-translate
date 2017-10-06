import translate from 'google-translate-api'
import langs from 'google-translate-api/languages'

export default class Translator {
    constructor(persister) {
        this.persister = persister
    }

    async setLang(userId, lang) {
        if (lang !== "" && !langs.isSupported(lang)) {
            throw new Error(`The language '${lang}' is not supported.`)
        }

        try {
            await this.persister.setLang(userId, lang)

            if (lang === "") {
                return lang
            } else {
                // Return the long name of the language
                return langs[langs.getCode(lang)]
            }
        } catch (e) {
            console.error(e)
            throw new Error("An error occurred while setting your language.")
        }
    }

    async translateText(userId, text) {
        let lang

        try {
            lang = await this.persister.getLang(userId)
        } catch (e) {
            console.error(e)
            throw new Error("Could not determine which language to translate to.")
        }

        if (!lang) {
            // No language selected, nothing to translate to.
            return null
        } else {
            try {
                const translation = await translate(text, {to: lang})
                return translation.text
            } catch (e) {
                console.error(e)
                throw new Error("There was an error during translation.")
            }
        }
    }
}
