import db from 'sqlite'

export default class SQLite {
    constructor(filepath) {
        this.filepath = filepath
    }

    async initialize() {
        try {
            await db.open(this.filepath)
            await db.run(`
                CREATE TABLE IF NOT EXISTS users
                    ( id TEXT PRIMARY KEY
                    , lang TEXT
                    )
            `)
        } catch(e) {
            console.error(e)

            // If we can't connect to the database, then there is not point continuing
            process.exit(1)
        }
    }

    async getLang(id) {
        const row = await db.get(`
            SELECT lang FROM users WHERE id = '${id}'
        `)

        return row.lang
    }

    async setLang(id, lang) {
        const langVal = lang ? `'${lang}'` : `NULL`
        return db.run(`
            INSERT OR REPLACE INTO users (id, lang)
                VALUES ('${id}', ${langVal})
        `)
    }
}