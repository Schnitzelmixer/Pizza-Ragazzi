$(function () {
    let visibilityToggle1 = document.getElementById("visibilityButton1");
    let visibilityToggle2 = document.getElementById("visibilityButton2");

    let username = document.getElementById("username");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let password2 = document.getElementById("password2");

    let username_error = document.getElementById("username_error");
    let email_error = document.getElementById("email_error")
    let password_error = document.getElementById("password_error");
    let password2_error = document.getElementById("password2_error");

    username.addEventListener('input', function () {
        if (username.value.length >= 1) {
            username_error.style.display = "none";
        }
    });

    email.addEventListener('input', function () {
        if (email.value.length >= 1) {
            email_error.style.display = "none";
        }
    });

    password.addEventListener('input', function () {
        if (password.value.length >= 1) {
            password_error.style.display = "none";
        }
    });

    password2.addEventListener('input', function () {
        if (password2.value.length >= 1) {
            password2_error.style.display = "none";
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

    visibilityToggle2.addEventListener('click', function () {
        if (password2.type === "password") {
            password2.type = "text";
            visibilityToggle2.innerHTML = 'visibility';
        } else {
            password2.type = "password";
            visibilityToggle2.innerHTML = 'visibility_off';
        }
    });
});

function validateCreateAccountData() {
    let username = document.forms['createAccountForm']['username'];
    let email = document.forms['createAccountForm']['email'];
    let password = document.forms['createAccountForm']['password'];
    let password2 = document.forms['createAccountForm']['password2'];

    let username_error = document.getElementById("username_error");
    let email_error = document.getElementById("email_error");
    let email_exists_error = document.getElementById("email_exists_error");
    let password_error = document.getElementById("password_error");
    let password2_error = document.getElementById("password2_error");
    let password_duplicate_error = document.getElementById("password_duplicate_error");

    let validAccountData = true;
    if (username.value.length < 1) {
        username_error.style.display = "block";
        validAccountData = false;
    }

    if (email.value.length < 1 || !email.value.match("[a-zA-Z0-9._%+-]+[@]+[a-zA-Z0-9.-]+[.]+[a-zA-Z]{2,6}")) {
        email_error.style.display = "block";
        email_exists_error.style.display = "none";
        validAccountData = false;
    }

    if (password.value !== password2.value) {
        password_duplicate_error.style.display = "block";
        password_error.style.display = "none";
        password2_error.style.display = "none";
        validAccountData = false;
    } else {
        password_duplicate_error.style.display = "none";
    }

    if (password.value.length < 1) {
        password_error.style.display = "block";
        password_duplicate_error.style.display = "none";
        validAccountData = false;
    }

    if (password2.value.length < 1) {
        password2_error.style.display = "block";
        password_duplicate_error.style.display = "none";
        validAccountData = false;
    }

    if (validAccountData) {
        createAccount();
    }
}

function changePage() {
    window.location.href = "logout";
}

function createAccount() {
    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let password2 = document.getElementById("password2").value;

    let email_exists_error = document.getElementById("email_exists_error");
    let username_exists_error = document.getElementById("username_exists_error");
    let create_account_error = document.getElementById("create_account_error");

    fetch("/login/createAccount", {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            password2: password2
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    })
        .then(result => result.text())
        .then(data => {
            let msg = data.toString();
            if (msg === "username is empty") {
                //already handled in validateCreateAccountData()
            } else if (msg === "email is not valid") {
                //already handled in validateCreateAccountData()
            } else if (msg === "password is empty") {
                //already handled in validateCreateAccountData()
            } else if (msg === "password does not match password2") {
                //already handled in validateCreateAccountData()
            } else if (msg === "email already in use") {
                email_exists_error.style.display = "block";
            } else if (msg === "username already in use") {
                username_exists_error.style.display = "block";
            } else if (msg === "user could not be created") {
                create_account_error.style.display = "block";
            } else {
                //TODO change this to game menu
                window.location.href = "menu";
            }
        })
}
