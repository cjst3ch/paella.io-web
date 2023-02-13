function renderRow(item, categories) {
    var dropdown = renderDropdown(item, categories)
    var unit = item.by_weight ? "kg" : "unit"
    var template = `<tr id="row-item-${item.id}">
        <th scope="row"><div id="item-name-${item.id}">${item.display_name}</div></th>
        <td><div id="item-unit-price-${item.id}">${item.unit_price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</div></td>
        <td><span id="item-quantity-${item.id}">${item.remaining_stock.toLocaleString('es-ES', { minimumFractionDigits: 3 })}</span> <span id="item-unit-${item.id}">${unit}</span></td>
        <td><input type="checkbox" onclick="changeByWeight(this, ${item.id})" ${item.by_weight ? "checked" : ""} /></td>
        <td style="text-align: center">
            <!-- <a href="" class="btn btn-primary border border-dark "
                id="category-btn">Category</a> -->
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2"
                    data-toggle="dropdown" aria-expanded="false" style="background-color: ${categories[item.category_id].category_color}">
                    ${categories[item.category_id].category_name}
                </button>
                ${dropdown}
            </div>
        </td>
        <td style="text-align: center"><a class="disabled btn btn-delete border border-dark"
                id="delete-btn" disabled onclick="removeItem(${item.id})"><i class="fa-solid fa-trash"></i></a></td>
    </tr>`
    return template
}

function changeByWeight(el, id) {
    var byWeight = el.checked
    updateItem(id, { by_weight: byWeight })
    if (byWeight) {
        document.getElementById("item-unit-" + id).innerText = "kg"
    } else {
        document.getElementById("item-unit-" + id).innerText = "unit"
    }
}

function renderCategory(category) {
    var template = `<tr>
        <th scope="row"><div id="cat-name-${category.id}">${category.category_name}</div></th>
        <td><div id="color-picker-cat${category.id}"></div></td>
        <td style="text-align: center"><button class="btn btn-delete" ${category.id == 0 ? "disabled" : ""} onclick="removeCategory(${category.id})"><i class="fa-solid fa-trash"></i></button></td>
    </tr>`

    return template
}

function renderFormDropdown(id, categories, selectCallbackName) {
    var out = `
    <div class="dropdown">
    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenu2"
        data-toggle="dropdown" aria-expanded="false" style="background-color: ${categories[id].category_color}">
        ${categories[id].category_name}
    </button>
    <div class="dropdown-menu category-menu">`;
    Object.values(categories).forEach(category => {
        out += `<button class="dropdown-item" type="button" onclick="${selectCallbackName}(${category.id})"><span style="background-color: ${category.category_color}; color: white; width: 100%; text-align: left" class="badge">${category.category_name}</span></button>`;
    })
    out += `</div>`
    return out
}

function renderDropdown(item, categories) {
    var out = `<div class="dropdown-menu category-menu">`;
    Object.values(categories).forEach(category => {
        out += `<button class="dropdown-item" type="button" onclick="setCategory(${item.id}, ${category.id})"><span style="background-color: ${category.category_color}; color: white; width: 100%; text-align: left" class="badge">${category.category_name}</span></button>`;
    })
    out += `</div>`
    return out
}

function removeCategory(id) {
    if (id == 0) return;
    deleteCategory(id, () => {
        renderCategories()
        renderItems()
    })
}

var inventoryBody = document.getElementById("inventory-body")

function renderItems() {
    getItems(items => {
        getCategories(categories => {
            var newHTML = ""
            Object.values(items).forEach(item => {
                newHTML += renderRow(item, categories)
            })
            inventoryBody.innerHTML = newHTML
            // Wire editable fields
            Object.values(items).forEach(item => {
                // Add editable name
                makeEditableField("item-name-" + item.id, value => {
                    // Send update to DB
                    updateItem(item.id, { display_name: value })
                    // Valid
                    return true;
                })

                // Add editable unit-price
                makeEditableField("item-unit-price-" + item.id, value => {
                    // Check for invalid
                    if (isNaN(value)) return false;
                    // Send update to DB
                    updateItem(item.id, { unit_price: value })
                    // Valid
                    return true;
                }, display => {
                    // Convert display to input
                    return parseFloat(display.replace(",", "."))
                }, input => {
                    // Convert input to display
                    return parseFloat(input).toFixed(2).replace(".", ",")
                })

                // Add editable quantity
                makeEditableField("item-quantity-" + item.id, value => {
                    // Check for invalid
                    if (isNaN(value)) return false;
                    // Send update to DB
                    updateItem(item.id, { quantity: value })
                    // Valid
                    return true;
                }, display => {
                    // Convert display to input
                    return parseFloat(display.replace(",", "."))
                }, input => {
                    // Convert input to display
                    return parseFloat(input).toFixed(3).replace(".", ",")
                })
            })
        })
    })
}

renderItems()

var categoryBody = document.getElementById("category-body")
var pickers = []

function renderCategories() {
    getCategories(categories => {
        var newHTML = ""
        Object.values(categories).forEach(category => {
            newHTML += renderCategory(category)
        })
        categoryBody.innerHTML = newHTML

        Object.values(categories).forEach(category => {
            // Add editable name
            makeEditableField("cat-name-" + category.id, value => {
                // Send update to DB
                setCategoryName(value, category.id)
                renderItems()
                return true;
            })

            // Add color picker
            var picker = Pickr.create({
                el: '#color-picker-cat' + category.id,
                theme: 'nano', // or 'monolith', or 'nano'
                default: category.category_color,
                comparison: false,
                components: {
                    // Main components
                    preview: true,
                    hue: true,

                    // Input / output Options
                    interaction: {
                        hex: false,
                        rgba: false,
                        hsla: false,
                        hsva: false,
                        cmyk: false,
                        input: false,
                        clear: false,
                        save: false
                    }
                }
            })
            picker.on('changestop', (source, instance) => {
                setCategoryColor(picker.getColor().toHEXA().toString(), category.id)
                renderItems()
            })
            pickers.push(picker)
        })
    })
}

renderCategories()

var addCategoryColorPicker = Pickr.create({
    el: '#new-category-color',
    theme: 'nano',
    default: '#FF0000',
    comparison: false,
    components: {
        // Main components
        preview: true,
        hue: true,

        // Input / output Options
        interaction: {
            hex: false,
            rgba: false,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: false,
            clear: false,
            save: false
        }
    }
})

var newCategoryName = document.getElementById("new-category-name")

var newItemCategory = 0
function newItemSetCategory(id) {
    newItemCategory = id
    renderFormCategory()
}

function renderFormCategory() {
    getCategories(categories => {
        document.getElementById('new-item-category').innerHTML = renderFormDropdown(newItemCategory, categories, "newItemSetCategory")
    })
}

var newItemName = document.getElementById("new-item-name")
var newItemUnitPrice = document.getElementById("new-item-unit-price")
var newItemByWeight = document.getElementById("new-item-by-weight")
function addItem() {
    var display_name = newItemName.value
    var unit_price = newItemUnitPrice.value
    var by_weight = newItemByWeight.checked

    sendItem({ display_name, unit_price, by_weight, category_id: newItemCategory }, () => {
        renderItems()
    })
}

function removeItem(id) {
    deleteItem(id, () => {
        renderItems()
    })
}

function addCategory() {
    var name = newCategoryName.value
    var color = addCategoryColorPicker.getColor().toHEXA().toString()
    sendCategory({ category_name: name, category_color: color }, () => {
        renderCategories()
        renderItems()
    })
}

renderFormCategory()