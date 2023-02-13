const express = require('express')

function hydrate(item) {
    return {
        ...item,
        remaining_stock: parseFloat(item.remaining_stock),
        total: parseFloat(item.total),
        sum: parseFloat(item.sum)
    }
}

function reports(db) {
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

    // GET /sales?from=<unix-timestamp-sec>&to=<unix-timestamp-sec>
    //     return sales in timeframe, grouped by item id
    router.route("/sales")
        .get(async (req, res, next) => {
            // If missing params, max
            if (!("from" in req.query)) {
                req.query.from = "0"
            }
            if (!("to" in req.query)) {
                req.query.to = "65401637007"
            }

            // Convert timestamps
            var fromDate = new Date(parseInt(req.query.from) * 1000)
            var toDate = new Date(parseInt(req.query.to) * 1000)

            // Get sales
            var sales = await db.query("SELECT i.display_name, subby.sum, (subby.sum * i.unit_price) as total FROM items i, (select l.item_id, sum(l.quantity) FROM receipt_lines l, receipts r WHERE l.receipt_id = r.id AND r.transaction_date >= $1 AND r.transaction_date <= $2 GROUP BY l.item_id) subby WHERE i.id = subby.item_id",
                fromDate,
                toDate)

            // Return sales data
            res.json({ sales: sales.map(hydrate) })
        })

    // GET /excess?from=<unix-timestamp-sec>&to=<unix-timestamp-sec>
    //     return excess items in timeframe, grouped by item id
    router.route("/excess")
        .get(async (req, res, next) => {
            // If missing params, max
            if (!("from" in req.query)) {
                req.query.from = "0"
            }
            if (!("to" in req.query)) {
                req.query.to = "65401637007"
            }

            // Convert timestamps
            var fromDate = new Date(parseInt(req.query.from) * 1000)
            var toDate = new Date(parseInt(req.query.to) * 1000)

            // Get excess
            var excess = await db.query("SELECT i.id, i.display_name, subby.sum, i.remaining_stock FROM items i, ( select l.item_id, sum(l.quantity) FROM receipt_lines l, receipts r WHERE l.receipt_id = r.id AND r.transaction_date >= $1 AND r.transaction_date <= $2 group by l.item_id ) subby WHERE i.id = subby.item_id AND subby.sum < (i.remaining_stock * 0.1)",
                fromDate,
                toDate)
            
            // Get unsold ("excess")
            var unsold = await db.query("SELECT * FROM items WHERE id not in (select i.id from items i, (select l.item_id, sum(l.quantity) FROM receipt_lines l, receipts r WHERE l.receipt_id = r.id AND r.transaction_date >= $1 AND r.transaction_date <= $2 group by l.item_id ) subby WHERE i.id = subby.item_id)",
                fromDate,
                toDate)

            // Return excess data
            res.json({ excess: [...excess, ...unsold].map(hydrate) })
        })

    // GET /restock?from=<unix-timestamp-sec>&to=<unix-timestamp-sec>
    //     return items in need of restock in timeframe, grouped by item id
    router.route("/restock")
        .get(async (req, res, next) => {
            // If missing params, max
            if (!("from" in req.query)) {
                req.query.from = "0"
            }
            if (!("to" in req.query)) {
                req.query.to = "65401637007"
            }

            // Convert timestamps
            var fromDate = new Date(parseInt(req.query.from) * 1000)
            var toDate = new Date(parseInt(req.query.to) * 1000)

            // Get restock
            var restock = await db.query("SELECT i.id, i.display_name, subby.sum, i.remaining_stock FROM items i, ( select l.item_id, sum(l.quantity) FROM receipt_lines l, receipts r WHERE l.receipt_id = r.id AND r.transaction_date >= $1 AND r.transaction_date <= $2 group by l.item_id ) subby WHERE i.id = subby.item_id AND subby.sum > i.remaining_stock",
                fromDate,
                toDate)

            // Return excess data
            res.json({ restock: restock.map(hydrate) })
        })

    // Return finished router
    return router

    /**
     * Returns a list of sales from the database.
     *
     * @param start The timestamp of the start of the time frame
     * @param finish The timestamp of the end of the time frame
     * @return list of the sales
     * @throws SQLException if the SQL query failed
     */
    //     public List<SalesInfo> getSalesRange(Timestamp start, Timestamp finish) throws SQLException {
    //     List<SalesInfo> sales = new ArrayList<>();
    //     pGetCustomDayRange.setTimestamp(1, start);
    //     pGetCustomDayRange.setTimestamp(2, finish);
    //     ResultSet result = pGetCustomDayRange.executeQuery();
    //     while (result.next()) {
    //         sales.add(new SalesInfo(result.getString("display_name"),
    //                 result.getDouble("sum"),
    //                 result.getDouble("total")));
    //     }
    //     return sales;
    // }
}

module.exports = reports;