const fs = require('fs')
const { Client } = require('pg')

var client = null

function getSettings(path, cb) {
    fs.readFile("credentials.json", function (err, text) {
        cb(JSON.parse(text))
    })
}

function makeConnection(settings, cb, err) {
    client = new Client({
        host: settings.host,
        user: settings.username,
        port: 5432,
        password: settings.password,
        database: settings.database
    })

    client.connect().catch(err).then(cb)
}

function query(query, ...values) {
    return client.query({
        text: query,
        values: values
    }).then(res => res.rows)
}

module.exports = { getSettings, makeConnection, query }