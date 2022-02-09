const gameProperties = {
    roundLength: 240,

    maxTimeBetweenOrders: 30,
    orderDelay: 2,
    minOrdersActive: 2,
    ordersActiveWhenStarting: 2,

    pizza_bakingTime: 10,
    pizza_timeUntilBurnt: 8, // additional to regular baking time
    pizza_timeUntilWarning: 4, // additional to regular baking time

    fruitNinja_distractionChance_percent: 12,
    fruitNinja_distractionDisablingTime: 2.5,
    fruitNinja_maxIngredientsInAir: 4,
    fruitNinja_minTimeBetweenThrows: 0.1,
    fruitNinja_xRange: 30,
    fruitNinja_yRange: 30,
    fruitNinja_hitmarkerShowingTime: 0.25,

    whack_distractionChance_percent: 0,
    whack_maxIngredientsShownAtOnce: 4,
    whack_minTimeBetweenShows: 0
}


const availableIngredients = [];

const possibleOrders = [];

const ovenList = [];

const existingDraggablePizzaInstances = [];

const existingDraggableIngredientInstances = [];


// AT STARTUP ---------------------------------------------------------------------------------------------------------

async function setupAvailableIngredients() {
    const ingredients = await getAvailableIngredients(); // fetch ingredients Json-Array
    console.log("Fetched ingredients:")
    console.log(ingredients)
    ingredients.forEach(function (item) {// Json-Array in availableIngredients-Array
        if (item.hasOwnProperty("display_time")) {
            availableIngredients.push(
                new StampingIngredient(item.id, item.name, item.picture_raw, item.picture_raw_distraction, item.picture_processed, item.picture_baked, item.picture_burnt, item.zIndex, {
                    disabling_time: item.disabling_time,
                    hits_required: item.hits_required,
                    display_time: item.display_time
                }))
        } else {
            availableIngredients.push(
                new ChoppingIngredient(item.id, item.name, item.picture_raw, item.picture_raw_distraction, item.picture_processed, item.picture_baked, item.picture_burnt, item.zIndex, {
                    vertex_x_inPercent: item.vertex_x_inPercent,
                    vertex_y_inPercent: item.vertex_y_inPercent,
                    speed: item.speed,
                    rotation: item.rotation,
                    hits_required: item.hits_required
                }))
        }
    });
}

async function setupAvailablePizzas() {
    const orders = await getAvailablePizzas();
    console.log("Fetched Orders:");
    console.log(orders);

    orders.forEach(function (item) {
        possibleOrders.push(new Order(item.name, item.points, item.order_time, item.ingredients));
    });
}

async function getAvailableIngredients() {
    let response = await fetch("pizza_rush/getAvailableIngredients");
    return response.json();
}

async function getAvailablePizzas() {
    let response = await fetch("pizza_rush/getAvailablePizzas");
    return response.json();
}

// --------------------------------------------------------------------

async function loadGameElements() {
    const music = new Audio('/assets/sounds/tarantella_napoletana.mp3');
    music.loop = true;
    music.volume = 0.01;
    await music.play();

    await setupAvailableIngredients();
    await setupAvailablePizzas();

    document.getElementById("loading").style.display = 'none';

    loadIngredientSection();
    loadOvens();
    loadRecipeList();
}

function loadIngredientSection() {

    availableIngredients.forEach(function (item, index) {
        // simply create the <div> element

        const ingredient = document.createElement('div');
        const image = document.createElement('img');
        const name = document.createElement('div')

        ingredient.setAttribute('class', 'box ingredientSectionItem');
        ingredient.setAttribute('onmousedown', 'pullNewIngredient(' + index + ')');

        image.setAttribute('src', item.picture_raw);

        name.innerText = item.name;

        ingredient.appendChild(image);
        ingredient.appendChild(name);

        document.getElementById('ingredientSection').getElementsByClassName('scroll_container').item(0).appendChild(ingredient);
    })
}

function loadOvens() {

    // this could later be dynamic:
    // for example load as many ovens as the player has bought
    ovenList.push(new Oven(),
        new Oven(),
        new Oven(),
        new Oven());
}

function loadRecipeList() {
    const recipeList = document.getElementById("recipeList");
    recipeList.onmouseenter = function () {
        expanded.style.display = "flex";
        // recipeList.innerText = "";
    };
    recipeList.onmouseleave = function () {
        expanded.style.display = "none";
        // recipeList.innerText = "recipes"
    };

    const expanded = document.createElement('div');
    recipeList.appendChild(expanded);

    for (let i = 0; i < possibleOrders.length; i++) {
        const current = possibleOrders[i];
        const div = createElement(current);
        expanded.appendChild(div);
    }


    function createElement(order) {
        const div = document.createElement('div');
        const heading = document.createElement('h2');
        const description = document.createElement('div');

        heading.innerHTML = order.name;
        let text = "";
        order.requestedPizza.ingredients.forEach(function (item) {
            text += item.name + ", ";
        })
        description.innerHTML = text;

        div.appendChild(heading);
        div.appendChild(description);
        return div;
    }
}


// PIZZA-VALIDATION & POINTS ------------------------------------------------------------------------------------------

function validatePizza(order, pizza) {

    console.assert(pizza instanceof DraggablePizzaInstance);
    console.assert(order instanceof Order);

    fetch("/pizza_rush/validate_pizza", {
        method: 'POST',
        body: JSON.stringify({
            orderPoints: order.points,
            orderIngredientIds: order.requestedPizza.getIngredientIds(),
            createdPizzaIngredientIds: pizza.getIngredientIds(),
            createdPizzaBakeStatus: pizza.bakeStatus
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(updateCurrentPoints)
        .catch((error) => {
            console.error('Error:', error);
        });
}

async function updateCurrentPoints() {
    document.getElementById("currentlyDisplayedPoints").textContent = "Punkte: " + await getCurrentPoints();
}

async function getCurrentPoints() {
    let returnedPoints = -1;
    return await fetch("/pizza_rush/get_current_points")
        .then(
            result => result.text()
        ).then(
            result => {
                returnedPoints = parseInt(result);
                return returnedPoints;
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
}

async function getCurrentPlayerHighscore() {
    let returnedPoints = -1;
    return await fetch("/profile/getHighScore")
        .then(
            result => result.text()
        ).then(
            result => {
                returnedPoints = parseInt(result);
                return returnedPoints;
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
}

async function getCurrentPlayerTotalPoints() {
    let returnedPoints = -1;
    return await fetch("/profile/getTotalPoints")
        .then(
            result => result.text()
        ).then(
            result => {
                returnedPoints = parseInt(result);
                return returnedPoints;
            }
        ).catch((error) => {
            console.error('Error:', error);
        });
}

async function setCurrentPlayerPoints(newTotalPoints, newHighscore) {
    fetch("/pizza_rush/setPlayerPoints", {
        method: 'POST',
        body: JSON.stringify({
            newTotalPoints: newTotalPoints,
            newHighscore: newHighscore
        }),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(data => {
            let msg = data.toString();
            console.log(msg);
        })

}

function resetPoints() {
    fetch("/pizza_rush/reset_points", {
        method: 'POST',
        credentials: "include"
    }).then(updateCurrentPoints)
        .catch((error) => {
            console.log('Error', error)
        })
}


// ROUND LIFECYCLE ----------------------------------------------------------------------------------------------------

let pizzaRushRunning = false;

function manageRushCountdown(timerContainerId) {
    if (!pizzaRushRunning) {

        resetPoints();

        class RushCountdown extends AbstractCountdown {

            // @Override
            onCountdownStart() {
                pizzaRushRunning = true;
                document.getElementById("startStop_overlay").style.visibility = "hidden";

                this.onCountdownInterval();

                OrderHandler.getInstance().start();
            }

            // @Override
            onCountdownInterval() {

                // Time calculations
                let secondsLeft = this.durationInSeconds - this.secondsPassed;
                let minutes = "" + Math.floor(secondsLeft / 60);
                let seconds = "" + secondsLeft - minutes * 60;
                if (seconds.toString().length < 2)
                    seconds = "0" + seconds;

                if (secondsLeft < 6)
                    AudioPlayer.round_lastFive();

                // Display the result in the affectedObject
                this.affectedObject.innerHTML = "Zeit: " + minutes + ":" + seconds;


            }

            // @Override
            // Hier könnte später die PizzaRush Runde beendet werden
            async onCountdownEnd() {
                AudioPlayer.round_end();

                pizzaRushRunning = false;
                document.getElementById("startStop_overlay").style.visibility = "visible";
                document.getElementById("startStop_overlay_text").innerHTML = "Runde vorbei!<br/>Du hast " + await getCurrentPoints() + " Punkte erreicht!";
                document.getElementById("startStop_overlay_button").innerHTML = "Nochmal spielen!"

                this.affectedObject.innerHTML = "END";
                await endGame();
                document.getElementById("startStop_overlay_button").onclick = restartGame;
            }
        }

        new RushCountdown(gameProperties.roundLength, document.getElementById(timerContainerId)).startCountdown(); // Countdown wird gestartet
    }
}

async function endGame() {

    // Stop all processes
    pizzaRushRunning = false;
    fruitNinjaRunning = false;
    whackAMoleRunning = false;
    OrderHandler.getInstance().stop();

    // Update player stats
    let currentPoints = await getCurrentPoints();
    let currentPlayerHighscore = await getCurrentPlayerHighscore();
    let currentPlayerTotalPoints = await getCurrentPlayerTotalPoints();
    if (currentPoints > currentPlayerHighscore) {
        currentPlayerHighscore = currentPoints;
    }
    await setCurrentPlayerPoints(currentPlayerTotalPoints + currentPoints, currentPlayerHighscore);

    resetPoints();
}

function restartGame() {
    window.location.reload(false);
}
