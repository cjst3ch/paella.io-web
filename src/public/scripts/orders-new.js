var cash = true

var productSku = document.getElementById("product-sku")
var itemQuantity = document.getElementById("item-quantity")
var checkoutBody = document.getElementById("checkout-body")

function addToOrder() {
    var sku = parseInt(productSku.value)
    var quantity = parseFloat(itemQuantity.value)

    getItem(sku, function (item) {
        if (sku in order) {
            order[sku].quantity += quantity
            order[sku].subtotal = item.unit_price * order[sku].quantity
        } else {
            var line = {
                item_id: sku,
                name: item.display_name,
                unit_price: item.unit_price,
                quantity: quantity,
                subtotal: item.unit_price * quantity,
                by_weight: item.by_weight
            }
            order[sku] = line
            addReceiptLine(line)
        }
        var total = 0
        Object.values(order).forEach(line => {
            total += line.subtotal
        })
        document.getElementById("checkout-amt").innerText = total.toLocaleString("es-ES", { minimumFractionDigits: 2 })
        checkoutBody.innerHTML = ""
        Object.values(order).forEach(addReceiptLine)
    })
}

function addReceiptLine(line) {
    checkoutBody.innerHTML += `
    <tr id="checkout-row-${line.item_id}">
        <th scope="row">${line.name}</th>
        <td>${line.unit_price.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</td>
        <td>${line.quantity.toLocaleString("es-ES", { minimumFractionDigits: 3 })} ${line.by_weight ? "kg" : "unit"}</td>
        <td>&euro;${line.subtotal.toLocaleString("es-ES", { minimumFractionDigits: 2 })}</td>
        <td>
            <button style="width:100%" id="clear-all-button" onclick="clearLine(${line.item_id})"
            class="btn btn-lg btn-delete"><i class="fa-solid fa-eraser"></i></button>
        </td>
    </tr>
    `
}

function addItem(id) {
    productSku.value = id.toString()
    itemQuantity.focus()
    itemQuantity.setSelectionRange(0, itemQuantity.value.length)
    updateUnit(id)
    updateName(id)
}

var selectedItemName = document.getElementById("selected-item-name")
var productUnit = document.getElementById("product-unit")

var skuUpdated = () => {
    var sku = parseInt(productSku.value)
    if (isNaN(sku)) {
        selectedItemName.innerText = "Invalid SKU!"
        selectedItemName.classList.add("item-marquee-err")
    } else {
        updateUnit(sku)
        updateName(sku)
    }
}

var order = {}

var addItemOnEnter = e => {
    if (e.keyCode === 13) {
        enterButton()
    }
}

productSku.addEventListener('keypress', addItemOnEnter)
itemQuantity.addEventListener('keypress', addItemOnEnter)

var updateUnit = id => getItem(id, function (item) {
    productUnit.innerText = item.by_weight ? "kg" : "unit"
})

var updateName = function (id) {
    getItem(id, function (item) {
        selectedItemName.innerText = item.display_name
        selectedItemName.classList.remove("item-marquee-err")
    }, function (err) {
        selectedItemName.innerText = "Invalid SKU!"
        selectedItemName.classList.add("item-marquee-err")
    })
}

var calcTotal = function (items) {
    var total = 0
    items.forEach(item => {
        total += item.unit_price * item.quantity
    })
    return total
}

var checkout = function () {
    // TODO: non-hardcoded employee_id
    var orderData = {
        cost: calcTotal(Object.values(order)),
        delivery_date: new Date(Date.now()).toISOString(),  // TODO: CHANGETHIS
        lines: Object.values(order),
        received: false
    }

    sendOrder(orderData, () => {
        checkoutBody.innerHTML = ""
        order = {}
        document.getElementById("checkout-amt").innerText = "0,00"
        selectedItemName.innerText = ""
        selectedItemName.classList.remove("item-marquee-err")
        advanceCursor(0)
    })
}

// Render categories
var itemBtns = document.getElementById("item-btns")

function renderCategories() {
    itemBtns.innerHTML = ""
    getCategories(categories => Object.values(categories).forEach(category => {
        itemBtns.innerHTML += `
        <div class="col-md-4 mb-2">
            <button class="btn" onclick="renderItems(${category.id})" style="width: 100%; text-align: center; color: white; background-color: ${category.category_color}">
                ${category.category_name} <span style="background-color: white; color: black; font-family: 'Rubik'" class="ml-2 badge">${category.count}</span>
            </button>
        </div>`
    }))
}

function renderItems(category) {
    itemBtns.innerHTML = ""
    itemBtns.innerHTML += "<div class=\"col-md-4 mb-2\"><button class=\"btn btn-light"
        + "\" onclick=\"renderCategories()\" style=\"width: 100%; text-align: center\">&lt;&lt; Back</button></div>"
    getItems(items => {
        var i = 1
        Object.values(items).filter(x => x.category_id == category).forEach(item => {
            itemBtns.innerHTML += "<div class=\"col-md-4 mb-2\"><button class=\"btn btn-"
                + ((Math.floor(i / 3) % 2) == 0 ? "delete" : "info")
                + "\" onclick=\"addItem("
                + item.id
                + ")\" style=\"width: 100%; text-align: center\">"
                + item.display_name
                + "</button></div>"
            i += 1
        })
    })
}

renderCategories()

// Clear one / clear all functions

function clearAll() {
    checkoutBody.innerHTML = ""
    order = {}
    document.getElementById("checkout-amt").innerText = "0,00"
}

function clearLine(id) {
    delete order[id]
    document.getElementById("checkout-row-" + id).remove()
    var total = calcTotal(Object.values(order))
    document.getElementById("checkout-amt").innerText = total.toLocaleString("es-ES", { minimumFractionDigits: 2 })
}