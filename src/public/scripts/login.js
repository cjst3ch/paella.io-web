var username = document.getElementById("username")

function login() {
    var id = username.value
    getEmployee(id, employee => {
        if (employee.is_admin) {
            window.location.replace("/manager.html")
        } else {
            window.location.replace("/checkout_employee.html")
        }
    })
}