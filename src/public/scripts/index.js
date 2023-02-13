// Formatting functions

function formatDBTime(ts, locale = 'es-ES') {
    var date = new Date(ts)
    return date.toLocaleDateString(locale) + " " + date.toLocaleTimeString(locale)
}

// TODO: money/number formatting

// DATABASE

function getOrders(start, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/orders?limit=25&start=" + start, true)
    xhr.send(null)
}

function getOrder(id, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/orders/" + id, true)
    xhr.send(null)
}

function updateOrder(id, data, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) return;
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/orders/" + id, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    console.log(data)
    xhr.send(JSON.stringify(data))
}

function getOrdersCount(callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText).count)
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/orders/count", true)
    xhr.send(null)
}

function getCategories(callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/categories", true)
    xhr.send(null)
}

function getItem(id, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/items/" + id, true)
    xhr.send(null)
}

function getItems(callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/items", true)
    xhr.send(null)
}

function setCategory(itemID, categoryID, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) renderItems()
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/items/" + itemID, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify({
        category_id: categoryID
    }))
}

function updateItem(id, data, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) return;
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/items/" + id, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify(data))
}

function setCategoryName(name, categoryID, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) return;
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/categories/" + categoryID, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify({
        category_name: name
    }))
}

function setCategoryColor(categoryColor, categoryID, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) return;
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/categories/" + categoryID, true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify({
        category_color: categoryColor
    }))
}

function getReceipt(id, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/receipts/" + id, true)
    xhr.send(null)
}

function getReceipts(start, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/receipts?limit=25&start=" + start, true)
    xhr.send(null)
}

function deleteCategory(id, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("DELETE", "/api/categories/" + id, true)
    xhr.send(null)
}

function getReceiptsCount(callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText).count)
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/receipts/count", true)
    xhr.send(null)
}

function sendReceipt(receipt, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/receipts", true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify(receipt))
}

function sendOrder(order, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/orders", true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify(order))
}

function swapColors() {
    var element = document.body;
    element.classList.toggle("colorblind");
}


function swapFonts() {
    var element = document.body;
    element.classList.toggle("dyslexic");
}

function sendItem(item, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/items", true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify(item))
}

function deleteItem(id, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("DELETE", "/api/items/" + id, true)
    xhr.send(null)
}

function sendCategory(category, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("POST", "/api/categories", true)
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.send(JSON.stringify(category))
}

function getSalesReports(callback, from, to, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/reports/sales?from=" + from + "&to=" + to, true)
    xhr.send(null)
}

function getExcessReports(callback, from, to, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/reports/excess?from=" + from + "&to=" + to, true)
    xhr.send(null)
}

function getRestockReports(callback, from, to, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/reports/restock?from=" + from + "&to=" + to, true)
    xhr.send(null)
}

function getEmployee(id, callback, err = console.error) {
    var xhr = new XMLHttpRequest()
    xhr.onload = function () {
        if (xhr.status == 200) callback(JSON.parse(xhr.responseText))
        else err(xhr.status, xhr.responseText)
    }
    xhr.open("GET", "/api/employees/" + id, true)
    xhr.send(null)
}


// Editables

function makeEditableField(id, editCallback, toEditFormat = (x => x), fromEditFormat = (x => x)) {
    var el = document.getElementById(id);

    // install tooltip
    // el.setAttribute('data-toggle', 'tooltip')
    // el.setAttribute('data-placement', 'top')
    // el.setAttribute('title', 'Double-click to edit')
    // $(el).tooltip()

    el.addEventListener('dblclick', () => {
        if (el.innerHTML.startsWith("<input")) return;
        var value = toEditFormat(el.innerText).toString()
        el.innerHTML = `<input class="form-control" type="text" value="${value}" />`
        var input = el.children[0]
        input.focus()
        input.setSelectionRange(0, value.length)

        var submit = function () {
            input.removeEventListener('blur', submit)
            input.removeEventListener('keydown', keydown)
            // If valid, update
            // Otherwise, rollback
            if (editCallback(input.value)) {
                // Update text
                el.innerHTML = fromEditFormat(input.value)
            } else {
                // Rollback
                el.innerHTML = fromEditFormat(value)
            }
        }

        var keydown = (e) => {
            if (e.key === 'Enter') {
                submit()
            }
        }

        input.addEventListener('blur', submit)
        input.addEventListener('keydown', keydown)
    })
}