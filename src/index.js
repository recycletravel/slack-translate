require('dotenv').config()
require = require("@std/esm")(module, { esm: "js" })
module.exports = require("./main.js").default
