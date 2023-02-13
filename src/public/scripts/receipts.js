// Render row in receipt (headers) table

function renderRow(receipt) {
    var template = `<tr>
    <td scope="row">${formatDBTime(receipt.transaction_date)}</td>
    <th scope="row">${receipt.employee_id}</th>
    <td scope="row">${receipt.id}</td>
    <td scope="row">${receipt.is_cash ? "Yes" : "No"}</td>
    <td scope="row">&euro;${receipt.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
    <td style="text-align: center"><button data-toggle="modal" data-target="#receiptViewModal" onclick="renderLines(${receipt.id})" class="btn btn-success border border-dark "
            id="view-btn"><i class="fa-solid fa-eye"></i></button></td>
    <td style="text-align: center"><button disabled class="disabled btn btn-delete border border-dark "
            id="delete-btn"><i class="fa-solid fa-file-circle-xmark"></i></button></td>
</tr>`

    return template
}

// Handle loading receipt headers

var receiptBody = document.getElementById("receipt-body")
var loadingBit = document.getElementById("loading-bit")

var cursor = 0

function advanceCursor(amount) {
    cursor += amount
    if (cursor <= 0) {
        cursor = 0
        document.getElementById("prev-btn").setAttribute("disabled", "")
    } else {
        document.getElementById("prev-btn").removeAttribute("disabled")
    }

    loadingBit.style.opacity = 1
    getReceiptsCount(count => {
        console.log(count)
        if (cursor + 25 >= count) {
            document.getElementById("next-btn").setAttribute("disabled", "")
        } else {
            document.getElementById("next-btn").removeAttribute("disabled")
        }

        getReceipts(cursor, receipts => {
            receiptBody.innerHTML = ""
            Object.values(receipts).forEach(receipt => {
                receiptBody.innerHTML += renderRow(receipt)
            })
            loadingBit.style.opacity = 0
        })
    })
}

advanceCursor(0)

// Handle loading single-receipt
// Render receipt view (table + data)

function renderLines(id) {
    document.getElementById("single-receipt-body").innerHTML = ""
    document.getElementById("receiptViewModalLabel").innerText = "View Receipt #" + id

    getItems(items => {
        getReceipt(id, receipt => {
            var out = ""
            for (var line of receipt.lines) {
                var template = `
                <tr>
                    <td>${items[line.item_id].display_name}</td>
                    <td>${line.quantity.toFixed(3).replace(".", ",")} ${items[line.item_id].by_weight ? "kg" : "unit"}</td>
                    <td>&euro;${(line.quantity * items[line.item_id].unit_price).toFixed(2).replace(".", ",")}</td>
                </tr>`
                out += template + "\n"
            }
            document.getElementById("single-receipt-body").innerHTML = out
        })
    })
}