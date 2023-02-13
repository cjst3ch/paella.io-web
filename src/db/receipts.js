const express = require('express')

function hydrate(receipt) {
    return { lines: [], ...receipt, total: parseFloat(receipt.total) }
}

function hydrateLine(line) {
    delete line["receipt_id"]
    return { ...line, quantity: parseFloat(line.quantity) }
}

function receipts(db) {
    var router = express.Router()

    // Get next id
    async function nextID() {
        var rows = await db.query("SELECT id FROM receipts ORDER BY id DESC LIMIT 1")
        if (rows.length == 0) {
            return 1
        } else {
            return rows[0].id + 1
        }
    }

    // GET / get all receipts
    // POST / add new receipt
    router.route("/")
        .get(async (req, res, next) => {

            // Create id->receipt dict
            var obj = {}

            // Get receipts & rows
            var receiptRows
            var lineRows

            // If using limit
            if (req.query.limit !== undefined) {
                var limit = parseInt(req.query.limit)

                // Get start (default 0)
                var start = 0
                if (req.query.start !== undefined) {
                    start = parseInt(req.query.start)
                }

                receiptRows = await db.query("SELECT * FROM receipts ORDER BY id DESC LIMIT $1 OFFSET $2", limit, start)

                // If receiptRows is empty
                if (receiptRows.length == 0) {
                    res.json({})
                    return
                }

                // If receiptRows is size 1 get only that ID, otherwise min/max ID
                if (receiptRows.length == 1) {
                    lineRows = await db.query("SELECT * FROM receipt_lines WHERE receipt_id = $1", receiptRows[0].id)
                } else {
                    var maxID = receiptRows[0].id
                    var minID = receiptRows[receiptRows.length - 1].id
                    lineRows = await db.query("SELECT * FROM receipt_lines WHERE receipt_id >= $1 AND receipt_id <= $2", minID, maxID)
                }
            } else {
                receiptRows = await db.query("SELECT * FROM receipts ORDER BY id DESC")
                lineRows = await db.query("SELECT * FROM receipt_lines")
            }

            // Interlace receipts with respective rows
            receiptRows.forEach(receipt => {
                obj[receipt.id] = hydrate(receipt)
            })
            lineRows.forEach(line => {
                obj[line.receipt_id].lines.push(hydrateLine(line))
            })

            // Respond to client
            res.json(obj)
        })
        .post(async (req, res, next) => {
            // If missing keys, fail
            if (!("lines" in req.body) || !("total" in req.body) || !("is_cash" in req.body) || !("employee_id" in req.body)) {
                res.status(400).json({ error: "Missing required field(s)!" })
                return
            }

            // If no lines, fail
            if (req.body.lines.length == 0) {
                res.status(400).json({ error: "Cannot add receipt with 0 lines!" })
                return
            }

            // Get next receipt id
            var id = await nextID()

            // Add receipt header
            var { lines, total, is_cash, employee_id } = req.body

            await db.query("INSERT INTO receipts (id, total, is_cash, employee_id) VALUES ($1, $2, $3, $4)",
                id,
                total,
                is_cash,
                employee_id)

            // Add receipt lines
            for (var line of lines) {
                await db.query("INSERT INTO receipt_lines (receipt_id, item_id, quantity) VALUES ($1, $2, $3)",
                    id,
                    line.item_id,
                    line.quantity)
            }

            // Reply with new ID
            res.json({ id })
        })

    // GET /count get # of receipts
    router.route("/count")
        .get(async (req, res, next) => {
            var rows = await db.query("SELECT COUNT(*) as count FROM receipts")
            var count = parseInt(rows[0].count)
            res.json({ count })
        })

    // GET /<id> get receipt
    // POST /<id> update receipt
    // DELETE /<id> delete receipt
    router.route("/:receiptId")
        .get(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.receiptId)

            // Get receipt with ID
            var rows = await db.query("SELECT * FROM receipts WHERE id = $1", intID)
            var receipt = rows[0];

            if (receipt === undefined) {
                res.status(404).json({ error: "Receipt not found!" })
                return
            }

            receipt = hydrate(receipt)

            // Get receipt lines
            var lines = await db.query("SELECT * FROM receipt_lines WHERE receipt_id = $1", intID)
            lines.forEach(line => receipt.lines.push(hydrateLine(line)))

            res.json(receipt)
        })
        .post(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.receiptId)

            // Update each key individually
            if ("total" in req.body) {
                await db.query("UPDATE receipts SET total = $2 WHERE id = $1", intID, req.body.total)
            }
            if ("is_cash" in req.body) {
                await db.query("UPDATE receipts SET is_cash = $2 WHERE id = $1", intID, req.body.is_cash)
            }
            if ("employee_id" in req.body) {
                await db.query("UPDATE receipts SET employee_id = $2 WHERE id = $1", intID, req.body.employee_id)
            }
            if ("lines" in req.body) {
                await db.query("DELETE FROM receipt_lines WHERE receipt_id = $1", intID)
                for (var line of req.body.lines) {
                    await db.query("INSERT INTO receipt_lines (receipt_id, item_id, quantity) VALUES ($1, $2, $3)",
                        intID,
                        line.item_id,
                        line.quantity)
                }
            }

            // NOTE: this could be calculated locally, or kept as a sanity check
            // Get updated receipt data
            var rows = await db.query("SELECT * FROM receipts WHERE id = $1", intID)
            var receipt = rows[0];

            if (receipt === undefined) {
                res.status(404).json({ error: "Receipt not found!" })
                return
            }

            receipt = hydrate(receipt)

            // NOTE: this could be calculated locally, or kept as a sanity check
            // Get updated receipt lines
            var lines = await db.query("SELECT * FROM receipt_lines WHERE receipt_id = $1", intID)
            lines.forEach(line => receipt.lines.push(hydrateLine(line)))

            // Finally send updated receipt data to user
            res.json(receipt)
        })
        .delete(async (req, res, next) => {
            // Parse URL param
            var intID = parseInt(req.params.receiptId)

            // Delete receipt and associated lines
            await db.query("DELETE FROM receipt_lines WHERE receipt_id = $1", intID)
            await db.query("DELETE FROM receipts WHERE id = $1", intID)

            res.json({ success: true })
        })

    // Return finished router
    return router
}

module.exports = receipts