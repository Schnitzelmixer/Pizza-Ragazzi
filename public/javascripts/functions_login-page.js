$(function () {
    let visibilityToggle1 = document.getElementById("visibilityButton1");

    let email = document.getElementById("email");
    let password = document.getElementById("password");

    let email_error = document.getElementById("email_error");
    let password_error = document.getElementById("password_error");
    let login_error = document.getElementById("login_error");

    email.addEventListener('input', function () {
        if (email.value.length >= 1) {
            email_error.style.display = "none";
            login_error.style.display = "none";
        }
    });

    password.addEventListener('input', function () {
        if (password.value.length >= 1) {
            password_error.style.display = "none";
            login_error.style.display = "none";
        }
    });

    visibilityToggle1.addEventListener('click', function () {
        if (password.type === "password") {
            password.type = "text";
            visibilityToggle1.innerHTML = 'visibility';
        } else {
            password.type = "password";
            visibilityToggle1.innerHTML = 'visibility_off';
        }
    });
});

function validateLoginData() {
    let email = document.forms['loginForm']['email'];
    let password = document.forms['loginForm']['password'];

    let email_error = document.getElementById("email_error");
    let password_error = document.getElementById("password_error");
    let login_error = document.getElementById("login_error");
    let wrong_password_error = document.getElementById("wrong_password_error");

    if (email.value.length < 1 || !email.value.match("[a-zA-Z0-9._%+-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,6}")) {
        email_error.style.display = "block";
        login_error.style.display = "none";
        wrong_password_error.style.display = "none";
    }

    if (password.value.length < 1) {
        password_error.style.display = "block";
        login_error.style.display = "none";
        wrong_password_error.style.display = "none";
    }

    authenticateLogin();
}

function changePage() {
    window.location.href = "createAccount";
}

function authenticateLogin() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let wrong_password_error = document.getElementById("wrong_password_error");
    let login_error = document.getElementById("login_error");

    fetch("/login/authenticate", {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password
            }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include'
        }
    ).then(
        result => result.text()
    ).then(data => {
            let msg = data.toString();
            if (msg === "wrong password") {
                wrong_password_error.style.display = "block";
            } else if (msg === "no user with this email") {
                login_error.style.display = "block";
                wrong_password_error.style.display = "none";
            } else if (msg !== "email is not valid" && msg !== "password is empty") {
                //TODO change this to game menu
                window.location.href = "menu";
            }
        }
    );
}
