function renderRow(order) {
    var template = `<tr>
    <td scope="row">${formatDBTime(order.delivery_date)}</td>
    <th scope="row">${order.id}</th>
    <td scope="row">&euro;${order.cost.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
    <td scope="row">${order.received ? "Yes" : "No"}</td>
    <td style="text-align: center"><button data-toggle="modal" data-target="#orderViewModal" onclick="renderLines(${order.id})" class="btn btn-submit border border-dark "
            id="view-btn"><i class="fa-solid fa-eye"></i></button></td>
    <td style="text-align: center"><a href="" disabled class="disabled btn btn-lg btn-delete border border-dark "
            id="delete-btn"><i class="fa-solid fa-file-circle-xmark"></i></a></td>
</tr>`

    return template
}

var orderBody = document.getElementById("order-body")
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
    getOrdersCount(count => {
        console.log(count)
        if (cursor + 25 >= count) {
            document.getElementById("next-btn").setAttribute("disabled", "")
        } else {
            document.getElementById("next-btn").removeAttribute("disabled")
        }

        getOrders(cursor, orders => {
            orderBody.innerHTML = ""
            Object.values(orders).forEach(order => {
                orderBody.innerHTML += renderRow(order)
            })
            loadingBit.style.opacity = 0
        })
    })
}

advanceCursor(0)

function renderLines(id) {
    document.getElementById("single-order-body").innerHTML = ""
    document.getElementById("orderViewModalLabel").innerText = "View Order #" + id

    getItems(items => {
        getOrder(id, order => {
            var out = ""
            for (var line of order.lines) {
                var template = `
                <tr>
                    <td>${items[line.item_id].display_name}</td>
                    <td><span id="order-line-quantity-${line.item_id}">${line.quantity.toFixed(3).replace(".", ",")} ${items[line.item_id].by_weight ? "kg" : "unit"}</span></td>
                    <td id="order-subtotal-${line.item_id}">&euro;${(line.quantity * items[line.item_id].unit_price).toFixed(2).replace(".", ",")}</td>
                </tr>`
                out += template + "\n"
            }
            document.getElementById("single-order-body").innerHTML = out
        })
    })
}