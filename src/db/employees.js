const express = require('express')

function employees(db) {
    var router = express.Router()


    // POST /<id> update category
    router.route("/:employeeId")
        .get(async (req, res, next) => {
            var employee = await db.query("SELECT * FROM employees WHERE id = $1", req.params.employeeId)
            if (employee.length == 0) res.status(404).json({error: "employee not found"})
            else res.json(employee[0])
        })

    // Return finished router
    return router
}

module.exports = employees;