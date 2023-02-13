const express = require('express')

function categories(db) {
    var router = express.Router()

    // Get next id
    async function nextID() {
        var rows = await db.query("SELECT id FROM categories ORDER BY id DESC LIMIT 1")
        if (rows.length == 0) {
            return 1
        } else {
            return rows[0].id + 1
        }
    }

    // GET / get all categories
    router.route("/")
        .get(async (req, res, next) => {
            // Create id->category dict
            var obj = {}

            // Add categories to dict
            var rows = await db.query("SELECT * FROM categories")
            rows.forEach(row => {
                obj[row.id] = { ...row, count: 0 }
            })

            // Calculate # of items in category
            rows = await db.query("SELECT category_id, COUNT(*) as count FROM items GROUP BY category_id")
            rows.forEach(row => {
                obj[row.category_id].count = parseInt(row.count)
            })

            // Respond to client
            res.json(obj)
        })
        .post(async (req, res, next) => {
            var id = await nextID()

            if (!("category_color" in req.body) || !("category_name" in req.body)) {
                res.status(400).json({ error: "Missing required field(s)!" })
            }

            await db.query("INSERT INTO categories (id, category_color, category_name) VALUES ($1, $2, $3)", id, req.body.category_color, req.body.category_name)

            res.json({ id })
        })


    // POST /<id> update category
    router.route("/:catId")
        .post(async (req, res, next) => {
            var intID = parseInt(req.params.catId)

            if (!("category_color" in req.body) && !("category_name" in req.body)) {
                res.status(400).json({ error: "Missing required field(s)!" })
            }

            if ("category_color" in req.body) {
                await db.query("UPDATE categories SET category_color = $2 WHERE id = $1", intID, req.body.category_color)
            }

            if ("category_name" in req.body) {
                await db.query("UPDATE categories SET category_name = $2 WHERE id = $1", intID, req.body.category_name)
            }

            var cat = (await db.query("SELECT * FROM categories WHERE id = $1", intID))[0]
            res.json(cat)
        })
        .delete(async (req, res, next) => {
            var intID = parseInt(req.params.catId)

            await db.query("DELETE FROM categories WHERE id = $1", intID)
            await db.query("UPDATE items SET category_id = 0 WHERE category_id = $1", intID)

            res.json({ success: true })
        })

    // Return finished router
    return router
}

module.exports = categories;