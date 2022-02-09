function setup() {
    setupUserData();
    setupMenuItems();
    checkForLevelUp();
}

function setupUserData() {

    const username = document.getElementById("username");
    const total_points = document.getElementById("total_points");
    const tier_name = document.getElementById("tier_name");

    $.get("/getUsername", function (data, status) {
        username.innerHTML = data;
    }).fail(function (data, status) {
        username.innerHTML = "Error"
        alert("Couldn't retrieve Username from session");
    });

    $.get("/profile/getTierName", function (data, status) {
        tier_name.innerHTML = data;
    }).fail(function (data, status) {
        tier_name.innerHTML = "Error"
        alert("Couldn't retrieve Tier name from database");
    });

    $.get("/profile/getTotalPoints", function (data, status) {
        total_points.innerHTML = "Gesamtpunkte: " + data;
    }).fail(function (data, status) {
        total_points.innerHTML = "Error"
        alert("Couldn't retrieve Total points from database");
    });
}

function setupMenuItems() {

    const pizzaRush = document.getElementById("pizzaRush");
    const tutorial = document.getElementById("tutorial");
    const memory = document.getElementById("memory");

    pizzaRush.firstElementChild.onmouseenter = function () {
        pizzaRush.children.item(1).style.visibility = "visible";
    }

    pizzaRush.firstElementChild.onmouseleave = function () {
        pizzaRush.children.item(1).style.visibility = "hidden";
    }

    tutorial.firstElementChild.onmouseenter = function () {
        tutorial.children.item(1).style.visibility = "visible";
    }

    tutorial.firstElementChild.onmouseleave = function () {
        tutorial.children.item(1).style.visibility = "hidden";
    }

    memory.firstElementChild.onmouseenter = function () {
        memory.children.item(1).style.visibility = "visible";
    }

    memory.firstElementChild.onmouseleave = function () {
        memory.children.item(1).style.visibility = "hidden";
    }
}

function checkForLevelUp() {

    $.get("/menu/checkForLevelUp", function (data, status) {
        const levelUpViewModel = JSON.parse(data);

        console.log(levelUpViewModel);

        if (levelUpViewModel.nextTierPoints === -1)
            document.getElementById("memory_description").innerHTML =
                "Du hast bereits das höchste Tier!<br>Spiele Memory um Punkte zu sammeln"
        else if (levelUpViewModel.levelUpPossible) {
            document.getElementById("memory_description").innerHTML =
                "Spiele jetzt Memory um ein \"" + levelUpViewModel.nextTier + "\" zu werden!";
            document.getElementById("memory_description").style.color = "#1ab100";
        } else
            document.getElementById("memory_description").innerHTML =
                "Erreiche " + levelUpViewModel.nextTierPoints + " Gesamtpunkte um ein \"" + levelUpViewModel.nextTier + "\" zu werden! <br>Bis dahin kannst du beim Memory Punkte sammeln"
    }).fail(function (data, status) {

    });
}