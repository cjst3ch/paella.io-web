const express = require('express')

function hydrate(item) {
    return {
        ...item,
        remaining_stock: parseFloat(item.remaining_stock),
        unit_price: parseFloat(item.unit_price)
    }
}

function items(db) {
    var router = express.Router()

    // Get next id
    async function nextID() {
        var rows = await db.query("SELECT id FROM items ORDER BY id DESC LIMIT 1")
        if (rows.length == 0) {
            return 1
        } else {
            return rows[0].id + 1
        }
    }

    // GET / get all items
    // POST / add new item
    router.route("/")
        .get(async (req, res, next) => {
            // Create id->item dict
            var obj = {}

            // Add items to dict
            var rows = await db.query("SELECT * FROM items");
            rows.forEach(row => {
                obj[row.id] = hydrate(row)
            })

            // Respond to client
            res.json(obj)
        })
        .post(async (req, res, next) => {
            // Check for all required keys
            if (!("display_name" in req.body) || !("unit_price" in req.body) || !("by_weight" in req.body)) {
                res.status(400).json({ error: "Missing required field(s)!" })
                return
            }

            // Unpack request body
            var { display_name, unit_price, by_weight, category_id } = req.body

            // Get next item id, and insert
            var id = await nextID()
            await db.query("INSERT INTO items (id, display_name, unit_price, by_weight, category_id) VALUES ($1, $2, $3, $4, $5)",
                id,
                display_name,
                unit_price,
                by_weight,
                category_id || 0)

            // Reply to client with new ID
            res.json({ id })
        })

    // GET /<id> get item
    // POST /<id> update item
    // DELETE /<id> delete item
    router.route("/:itemId")
        .get(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.itemId)

            // Get item with that ID
            var rows = await db.query("SELECT * FROM items WHERE id = $1", intID)
            if (rows.length == 0) {
                res.status(404).json({ error: "Item not found" })
            } else {
                res.json(hydrate(rows[0]))
            }
        })
        .post(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.itemId)

            // Update each key individually
            if ("display_name" in req.body) {
                await db.query("UPDATE items SET display_name = $2 WHERE id = $1", intID, req.body.display_name)
            }
            if ("unit_price" in req.body) {
                await db.query("UPDATE items SET unit_price = $2 WHERE id = $1", intID, req.body.unit_price)
            }
            if ("by_weight" in req.body) {
                await db.query("UPDATE items SET by_weight = $2 WHERE id = $1", intID, req.body.by_weight)
            }
            if ("remaining_stock" in req.body) {
                await db.query("UPDATE items SET remaining_stock = $2 WHERE id = $1", intID, req.body.remaining_stock)
            }
            if ("category_id" in req.body) {
                await db.query("UPDATE items SET category_id = $2 WHERE id = $1", intID, req.body.category_id)
            }

            // Reply with new item data
            var item = await db.query("SELECT * FROM items WHERE id = $1", intID)
            res.json(hydrate(item[0]))
        })
        .delete(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.itemId)

            // Delete item
            await db.query("DELETE FROM items WHERE id = $1", intID)
            res.json({ success: true })
        })

    // Return finished router
    return router
}

module.exports = items