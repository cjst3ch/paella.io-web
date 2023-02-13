const express = require('express')

function hydrate(order) {
    return { lines: [], ...order, cost: parseFloat(order.cost) }
}

function hydrateLine(line) {
    delete line["order_id"]
    return { ...line, quantity: parseFloat(line.quantity) }
}

function orders(db) {
    var router = express.Router()

    // Get next id
    async function nextID() {
        var rows = await db.query("SELECT id FROM orders ORDER BY id DESC LIMIT 1")
        if (rows.length == 0) {
            return 1
        } else {
            return rows[0].id + 1
        }
    }

    // GET / get all orders
    // POST / add new order
    router.route("/")
        .get(async (req, res, next) => {
            // Create id->order dict
            var obj = {}

            // Get orders & rows
            var orderRows
            var lineRows

            // If using limit
            if (req.query.limit !== undefined) {
                var limit = parseInt(req.query.limit)

                // Get start (default 0)
                var start = 0
                if (req.query.start !== undefined) {
                    start = parseInt(req.query.start)
                }

                orderRows = await db.query("SELECT * FROM orders ORDER BY id DESC LIMIT $1 OFFSET $2", limit, start)

                // If orderRows is empty
                if (orderRows.length == 0) {
                    res.json({})
                    return
                }

                // If orderRows is size 1 get only that ID, otherwise min/max ID
                if (orderRows.length == 1) {
                    lineRows = await db.query("SELECT * FROM order_lines WHERE order_id = $1", orderRows[0].id)
                } else {
                    var maxID = orderRows[0].id
                    var minID = orderRows[orderRows.length - 1].id
                    lineRows = await db.query("SELECT * FROM order_lines WHERE order_id >= $1 AND order_id <= $2", minID, maxID)
                }
            } else {
                orderRows = await db.query("SELECT * FROM orders ORDER BY id DESC")
                lineRows = await db.query("SELECT * FROM order_lines")
            }

            // Interlace orders with respective rows
            orderRows.forEach(order => {
                obj[order.id] = hydrate(order)
            })
            lineRows.forEach(line => {
                obj[line.order_id].lines.push(hydrateLine(line))
            })

            // Respond to client
            res.json(obj)
        })
        .post(async (req, res, next) => {
            // If missing keys, fail
            if (!("lines" in req.body) || !("cost" in req.body) || !("delivery_date" in req.body) || !("received" in req.body)) {
                res.status(400).json({ error: "Missing required field(s)!" })
                return
            }

            // If no lines, fail
            if (req.body.lines.length == 0) {
                res.status(400).json({ error: "Cannot add order with 0 lines!" })
                return
            }

            // Get next order id
            var id = await nextID()

            // Add order header
            var { lines, cost, delivery_date, received } = req.body

            await db.query("INSERT INTO orders (id, cost, delivery_date, received) VALUES ($1, $2, $3, $4)",
                id,
                cost,
                delivery_date,
                received)

            // Add order lines
            for (var line of lines) {
                await db.query("INSERT INTO order_lines (order_id, item_id, quantity) VALUES ($1, $2, $3)",
                    id,
                    line.item_id,
                    line.quantity)
            }

            // Reply with new ID
            res.json({ id })
        })

    // GET /count get # of orders
    router.route("/count")
        .get(async (req, res, next) => {
            var rows = await db.query("SELECT COUNT(*) as count FROM orders")
            var count = parseInt(rows[0].count)
            res.json({ count })
        })

    // GET /<id> get order
    // POST /<id> update order
    // DELETE /<id> delete order
    router.route("/:orderId")
        .get(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.orderId)

            // Get order with ID
            var rows = await db.query("SELECT * FROM orders WHERE id = $1", intID)
            var order = rows[0];

            if (order === undefined) {
                res.status(404).json({ error: "Order not found!" })
                return
            }

            order = hydrate(order)

            // Get order lines
            var lines = await db.query("SELECT * FROM order_lines WHERE order_id = $1", intID)
            lines.forEach(line => order.lines.push(hydrateLine(line)))

            res.json(order)
        })
        .post(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.orderId)

            // Update each key individually
            if ("cost" in req.body) {
                await db.query("UPDATE orders SET cost = $2 WHERE id = $1", intID, req.body.cost)
            }
            if ("delivery_date" in req.body) {
                await db.query("UPDATE orders SET delivery_date = $2 WHERE id = $1", intID, req.body.delivery_date)
            }
            if ("received" in req.body) {
                await db.query("UPDATE orders SET received = $2 WHERE id = $1", intID, req.body.received)
            }
            if ("lines" in req.body) {
                await db.query("DELETE FROM order_lines WHERE order_id = $1", intID)
                for (var line of req.body.lines) {
                    await db.query("INSERT INTO order_lines (order_id, item_id, quantity) VALUES ($1, $2, $3)",
                        intID,
                        line.item_id,
                        line.quantity)
                }
            }

            // NOTE: this could be calculated locally, or kept as a sanity check
            // Get updated order data
            var rows = await db.query("SELECT * FROM orders WHERE id = $1", intID)
            var order = rows[0];

            if (order === undefined) {
                res.status(404).json({ error: "Order not found!" })
                return
            }

            order = hydrate(order)

            // NOTE: this could be calculated locally, or kept as a sanity check
            // Get updated order lines
            var lines = await db.query("SELECT * FROM order_lines WHERE order_id = $1", intID)
            lines.forEach(line => order.lines.push(hydrateLine(line)))

            // Finally send updated order data to user
            res.json(order)
        })
        .delete(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.orderId)

            // Delete order and associated lines
            await db.query("DELETE FROM order_lines WHERE order_id = $1", intID)
            await db.query("DELETE FROM orders WHERE id = $1", intID)

            res.json({ success: true })
        })

    // Return finished router
    return router
}

module.exports = orders