// An "Ingredient" is only a definition of an ingredient without any behavior.
class AbstractIngredient {

    static picture_type = {
        RAW: 1,
        RAW_DISTRACTION: 2,
        PROCESSED: 3,
        BAKED: 4,
        BURNT: 5
    }
    // ATTRIBUTES --------------------
    id;
    name;
    picture_raw;
    picture_raw_distraction;
    picture_processed;
    picture_baked;
    picture_burnt;
    zIndex;

    constructor(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt, zIndex) {
        this.id = id;
        this.name = name;
        this.picture_raw = picture_raw;
        this.picture_raw_distraction = picture_raw_distraction;
        this.picture_processed = picture_processed;
        this.picture_baked = picture_baked;
        this.picture_burnt = picture_burnt;
        this.zIndex = zIndex;
    }

    //returns an instance of the ingredient with this name
    static getInstanceByName(name) {
        let ret = undefined

        availableIngredients.forEach(function (item) {
            if (name === item.name)
                ret = item;
        });

        return ret;
    }

    createDraggableInstance() {
        return new DraggableIngredientInstance(this);
    }

    createImg(picture_type) {
        const ret = document.createElement('img');

        switch (picture_type) {
            case 1:
                ret.setAttribute('src', this.picture_raw);
                break;
            case 2:
                ret.setAttribute('src', this.picture_raw_distraction);
                break;
            case 3:
                ret.setAttribute('src', this.picture_processed);
                break;
            case 4:
                ret.setAttribute('src', this.picture_baked);
                break;
            case 5:
                ret.setAttribute('src', this.picture_burnt);
                break;
        }

        ret.setAttribute('alt', this.name);
        ret.setAttribute('width', '110px');
        ret.setAttribute('height', '110px');

        ret.style.zIndex = this.zIndex;

        return ret;
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }
}

class ChoppingIngredient extends AbstractIngredient {

    flight_behavior;

    constructor(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt, zIndex, flight_behavior) {
        super(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt, zIndex);
        this.flight_behavior = flight_behavior;
    }
}

class StampingIngredient extends AbstractIngredient {

    stamp_behavior;

    constructor(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt, zIndex, stamp_behavior) {
        super(id, name, picture_raw, picture_raw_distraction, picture_processed, picture_baked, picture_burnt, zIndex);
        this.stamp_behavior = stamp_behavior;
    }
}

// A "DraggableIngredientInstance" is an actual Ingredient you can interact with and drag around
class DraggableIngredientInstance extends AbstractIngredient {

    // ATTRIBUTES --------------------

    static Status = {
        RAW: 1,
        PROCESSED: 3,
        BAKED: 4,
        BURNT: 5
    };
    draggable; // Actual draggable html-element
    parentIngredient; // StampingIngredient or ChoppingIngredient
    status;
    isDragEnabled;

    constructor(ingredient) {
        super(ingredient.id, ingredient.name, ingredient.picture_raw, ingredient.picture_raw_distraction, ingredient.picture_processed, ingredient.picture_baked, ingredient.picture_burnt);
        this.parentIngredient = ingredient;
        existingDraggableIngredientInstances.push(this);

        this.createDraggable();
        this.isDragEnabled = true;
        this.setStatus(DraggableIngredientInstance.Status.RAW);
    }


    createDraggable() {
        const draggable = this.parentIngredient.createImg(AbstractIngredient.picture_type.RAW);

        draggable.setAttribute('class', 'draggable');

        document.getElementById("ingredient_layer").appendChild(draggable);
        this.draggable = draggable;

        makeDraggable(this);
    }

    delete() {
        this.draggable.remove();
        const index = existingDraggableIngredientInstances.indexOf(this);
        existingDraggableIngredientInstances.splice(index, 1);
    }

    instanceOf(compareClass) {
        return this.parentIngredient instanceof compareClass;
    }

    setStatus(status) {
        this.status = status;

        switch (this.status) {
            case DraggableIngredientInstance.Status.RAW:
                this.draggable.setAttribute('src', this.parentIngredient.picture_raw);
                break;
            case DraggableIngredientInstance.Status.PROCESSED:
                this.draggable.setAttribute('src', this.parentIngredient.picture_processed);
                break;
            case DraggableIngredientInstance.Status.BAKED:
                this.draggable.setAttribute('src', this.parentIngredient.picture_baked);
                break;
            case DraggableIngredientInstance.Status.BURNT:
                this.draggable.setAttribute('src', this.parentIngredient.picture_burnt);
                break;
        }
    }

    // utility to disable dragging temporarily
    setIsDragEnabled(boolean) {
        this.isDragEnabled = boolean;
    }

    whenDraggedInPizza(pizza) {

        //Play sound
        AudioPlayer.mash();

        //Put ingredient on pizza
        pizza.ingredients.push(AbstractIngredient.getInstanceByName(this.getName()));

        pizza.updateDiv();

        //Remove single draggable ingredient
        this.delete();
    }
}

// --------------------------------------------------------------------

// A "Pizza" is only a definition of ingredients without any behavior.
// Example: A "Pizza" is something on the menu in the restaurant
//          A "DraggablePizzaInstance" is on a plate and can be manipulated (and eaten)
class Pizza {

    // ATTRIBUTES --------------------

    ingredients = [];

    // When created, a new pizza is simply a piece of dough. More ingredients get added while playing.
    constructor() {
        this.ingredients.push(AbstractIngredient.getInstanceByName("Impasto"))
    }

    getIngredientIds() {
        let ingredientIds = [];

        this.ingredients.forEach(function (value) {
            ingredientIds.push(value.id)
        })
        return ingredientIds
    }
}

// A "DraggablePizzaInstance" is the actual Pizza you can interact with and drag around
class DraggablePizzaInstance extends Pizza {

    // ATTRIBUTES --------------------

    static bakeStatus = {
        UNBAKED: 3,
        WELL: 4,
        BURNT: 5
    };
    draggable; // Actual draggable html-element
    bakingTimeInSeconds; // required baking time
    timeInOvenInMilliseconds = 0; // actual time spent in oven
    isInOven;
    isDragEnabled;
    bakeStatus;

    constructor() {
        super();
        this.setBakeStatus(DraggablePizzaInstance.bakeStatus.UNBAKED);

        existingDraggablePizzaInstances.push(this);
        document.getElementById("pizza_layer").appendChild(this.draggable);

        this.isDragEnabled = true;
        this.bakingTimeInSeconds = gameProperties.pizza_bakingTime;
    }


    static findExistingPizzaByDiv(div) {
        existingDraggablePizzaInstances.forEach(function (item) {
            if (item.draggable === div)
                return item;
        })

        return undefined;
    }

    // utility to disable dragging temporarily
    setIsDragEnabled(boolean) {
        this.isDragEnabled = boolean;
    }

    getName() {
        // temporary return values
        switch (this.bakeStatus) {
            case 0:
                return "unknown unbaked pizza";
            case 1:
                return "unknown baked pizza";
            case 2:
                return "unknown burnt pizza"
        }
    }

    // returns an updated <div> with all the ingredients in it
    updateDiv() {

        const pizzaDivUpdated = document.createElement("div");
        const pizzaDivOld = this.draggable;

        const currentBakeStatus = this.bakeStatus;

        pizzaDivUpdated.setAttribute('class', 'draggable');

        this.ingredients.forEach(function (item) {

            const ingredient = item.createImg(currentBakeStatus);
            ingredient.style.position = "absolute";

            pizzaDivUpdated.appendChild(ingredient);
        })

        document.getElementById("pizza_layer").appendChild(pizzaDivUpdated);

        // Sets the size of the <div> to the size of the <img> in it
        // without this, checkOverlap() couldn't calculate the middle point of the <div>
        const child_box = pizzaDivUpdated.firstElementChild.getBoundingClientRect();
        pizzaDivUpdated.style.width = child_box.width + "px";
        pizzaDivUpdated.style.height = child_box.height + "px";

        if (pizzaDivOld !== undefined) {
            alignDraggableToDestination(pizzaDivUpdated, pizzaDivOld);
            document.getElementById("pizza_layer").removeChild(pizzaDivOld);
            pizzaDivOld.remove();
        }

        this.draggable = pizzaDivUpdated;
        makeDraggable(this);
    }

    delete() {
        this.draggable.remove();
        const index = existingDraggablePizzaInstances.indexOf(this);
        existingDraggablePizzaInstances.splice(index, 1);
    }

    whenDraggedInOrder(order) {
        existingDraggablePizzaInstances.splice(existingDraggablePizzaInstances.indexOf(this), 1);
        this.draggable.remove();
    }

    whenDraggedInOven(oven) {

        this.ovenIn();
        oven.bake(this);
        alignDraggableToDestination(this.draggable, oven.gameElement.image);
    }

    ovenIn() {
        this.isInOven = true;
    }

    ovenOut() {
        this.isInOven = false;

        console.log("pizza baked: " + this.bakeStatus);
    }

    setBakeStatus(bakeStatus) {
        this.bakeStatus = bakeStatus;
        this.updateDiv();
    }

    updateBakeStatus() {
        // determine bakeStatus of the pizza
        const difference = this.bakingTimeInSeconds - this.timeInOvenInMilliseconds / 1000;
        if (difference < -gameProperties.pizza_timeUntilBurnt)
            this.setBakeStatus(DraggablePizzaInstance.bakeStatus.BURNT);
        else if (difference < 0)
            this.setBakeStatus(DraggablePizzaInstance.bakeStatus.WELL);
    }
}

// --------------------------------------------------------------------

class Oven {

    // ATTRIBUTES --------------------

    gameElement; //in game representation of the oven

    constructor() {
        this.gameElement = document.createElement('div');
        this.gameElement.image = document.createElement('img');

        this.gameElement.setAttribute('class', "oven unclickable");
        this.gameElement.image.setAttribute('src', "/assets/images/oven.png");
        this.gameElement.image.setAttribute('alt', "Oven");

        this.gameElement.appendChild(this.gameElement.image);

        // Creating an oven instance automatically displays it
        document.getElementById("oven_container").appendChild(this.gameElement);
    }


    // baking animation, manipulating the oven timer AND the pizza inside the oven
    bake(pizza) {

        // Play sound
        AudioPlayer.fire();

        const oven = this;
        let start;

        // creating the timer element <p> --------------------------------------
        const timer = document.createElement('p');
        timer.setAttribute('style', "position: absolute; z-index: 45; font-size: 2em");
        timer.setAttribute('class', "unclickable");
        timer.innerText = pizza.bakingTimeInSeconds;

        this.gameElement.appendChild(timer);

        // BAKING TIMER ANIMATION ----------------------------------------------
        let lastTimestamp;

        // this method describes one animation step
        function bakingAnimation(timestamp) {
            if (start === undefined) {
                start = timestamp;
                lastTimestamp = timestamp;
            }
            const elapsed = timestamp - start; // elapsed = time passed since animation start [milliseconds]

            // manipulate pizza: increment timeInOvenInMilliseconds
            const differenceSinceLastAnimationFrame = timestamp - lastTimestamp;
            pizza.timeInOvenInMilliseconds += differenceSinceLastAnimationFrame;
            pizza.updateBakeStatus();

            // manipulate timer: update the timer
            console.assert(gameProperties.pizza_timeUntilBurnt > gameProperties.pizza_timeUntilWarning);
            const timerCount = (Math.floor(pizza.bakingTimeInSeconds - pizza.timeInOvenInMilliseconds / 1000 + 1));
            if (timerCount > 0)
                timer.innerText = timerCount.toString();
            else if (timerCount > -gameProperties.pizza_timeUntilWarning)
                timer.innerText = "DONE";
            else if (timerCount > -gameProperties.pizza_timeUntilBurnt)
                timer.innerText = "!!!"
            else
                timer.innerText = "BURNT"

            // Decide whether to stop animation or not
            if (!pizza.isInOven) { // pizza.ovenOut() method sets isInOven to false when pizza is dragged out of oven
                // stop animation
                timer.remove();
            } else {
                // continue animation (a.k.a. continue baking)
                lastTimestamp = timestamp;
                pizza.updateDiv();
                window.requestAnimationFrame(bakingAnimation);
            }
        }

        window.requestAnimationFrame(bakingAnimation); // this command initially starts the animation
    }
}

// --------------------------------------------------------------------

class Order {

    // ATTRIBUTES --------------------

    name; // name to display in game
    requestedPizza; // pizza used for validation [Pizza.class]

    points;
    timeInSeconds; // time before order expires

    gameElement; //in game representation of the order

    animationRunning = false;

    constructor(name, points, timeInSeconds, ingredients) {
        this.name = name;
        this.points = points;
        this.timeInSeconds = timeInSeconds;
        this.requestedPizza = new Pizza();
        this.requestedPizza.ingredients = [];
        this.requestedPizza.ingredients.push.apply(this.requestedPizza.ingredients, ingredients)
    }

    getCopy() {
        return new Order(this.name, this.points, this.timeInSeconds, this.requestedPizza.ingredients);
    }

    createGameElement() {
        this.gameElement = document.createElement('div');
        this.gameElement.timeIndicator = document.createElement('div');
        this.gameElement.text = document.createElement('p');

        this.gameElement.setAttribute('class', 'box order');

        this.gameElement.text.innerHTML = this.name;

        this.gameElement.appendChild(this.gameElement.text);
        this.gameElement.appendChild(this.gameElement.timeIndicator);

        document.getElementById('orderSection').getElementsByClassName('scroll_container').item(0).appendChild(this.gameElement);
    }

    // starts the animation of the order timeIndicator
    startAnimation() {
        const thisOrder = this;
        let start;

        let gameElement_box;
        let timeIndicator_box;

        thisOrder.animationRunning = true;

        // this is one animation step
        function updateTimeIndicator(timestamp) {
            if (start === undefined)
                start = timestamp;
            const elapsed = timestamp - start; // elapsed = time passed since animation start [milliseconds]

            gameElement_box = thisOrder.gameElement.getBoundingClientRect();
            timeIndicator_box = thisOrder.gameElement.timeIndicator.getBoundingClientRect();

            // update time indicator
            let timeLeftInDecimal = Math.max(((thisOrder.timeInSeconds * 1000 - elapsed) / (thisOrder.timeInSeconds * 1000)), 0) // percentage of time left [min = 0]
            thisOrder.gameElement.timeIndicator.style.height = (gameElement_box.height - 8) + "px"; // always the same
            thisOrder.gameElement.timeIndicator.style.width = gameElement_box.width * (timeLeftInDecimal) + "px";

            // set indicator color according to percentage of time left
            if (timeLeftInDecimal > 0.5)
                thisOrder.gameElement.timeIndicator.style.backgroundColor = "green";
            else if (timeLeftInDecimal > 0.2)
                thisOrder.gameElement.timeIndicator.style.backgroundColor = "yellow";
            else
                thisOrder.gameElement.timeIndicator.style.backgroundColor = "red";


            if (elapsed < thisOrder.timeInSeconds * 1000) { // Stop the animation when time is over
                if (thisOrder.animationRunning)
                    window.requestAnimationFrame(updateTimeIndicator);
            } else
                OrderHandler.getInstance().notifyExpired(thisOrder);
        }

        window.requestAnimationFrame(updateTimeIndicator);
    }

    stopAnimation() {
        this.animationRunning = false;
    }

    getName() {
        return this.name;
    }
}

// Responsible for WHAT is ordered and WHEN
class OrderHandler {

    static orderHandler = new OrderHandler();
    activeOrders = [];
    isRunning;

    static getInstance() {
        return this.orderHandler;
    }

    start() {

        this.isRunning = true;
        const orderHandler = this;
        let lastTimestamp = window.performance.now();
        let timeSinceLastOrder = 0;

        for (let i = 0; i < gameProperties.ordersActiveWhenStarting; i++)
            this.activateOrder(this.drawRandomOrder());

        function orderFlow(timestamp) {

            timeSinceLastOrder += timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            if (orderHandler.activeOrders.length < gameProperties.minOrdersActive) {
                orderHandler.activateOrder(orderHandler.drawRandomOrder(), gameProperties.orderDelay * 1000);
                timeSinceLastOrder = 0;
            }

            if (timeSinceLastOrder > gameProperties.maxTimeBetweenOrders * 1000) {
                orderHandler.activateOrder(orderHandler.drawRandomOrder());
                timeSinceLastOrder = 0;
            }


            if (orderHandler.isRunning)
                window.requestAnimationFrame(orderFlow);
        }

        window.requestAnimationFrame(orderFlow);
    }

    stop() {
        this.isRunning = false;

        this.activeOrders.forEach(function (item) {
            item.stopAnimation();
        })
    }

    drawRandomOrder() {

        const ordersToChooseFrom = [];
        ordersToChooseFrom.push.apply(ordersToChooseFrom, possibleOrders);
        // this.activeOrders.forEach(function (item) {
        //     if (ordersToChooseFrom.includes(item))
        //         ordersToChooseFrom.splice(item, 1);
        // })

        const randomIndex = Math.floor(ordersToChooseFrom.length * Math.random());

        return ordersToChooseFrom[randomIndex].getCopy();
    }

    activateOrder(order, delay = undefined) {


        this.activeOrders.push(order);

        if (delay)
            setTimeout(function () {
                AudioPlayer.order_new();
                order.createGameElement();
                order.startAnimation();
            }, delay);
        else {
            AudioPlayer.order_new();
            order.createGameElement();
            order.startAnimation();
        }

    }

    notifyDelivered(order, receivedPizza) {
        let orderIds = [];
        let pizzaIds = [];

        function fillIdArray(origArray, idArray) {
            for (let i = 0; i < origArray.length; i++) {
                idArray.push(origArray[i].id);
            }
        }

        const equalsIgnoreOrder = (order, pizza) => {
            if (order.length !== pizza.length) return false;
            const uniqueValues = new Set([...order, ...pizza]);
            for (const v of uniqueValues) {
                const aCount = order.filter(e => e === v).length;
                const bCount = pizza.filter(e => e === v).length;
                if (aCount !== bCount) return false;
            }
            return true;
        }

        fillIdArray(order.requestedPizza.ingredients, orderIds)
        fillIdArray(receivedPizza.ingredients, pizzaIds)

        // Play sound
        if (equalsIgnoreOrder(orderIds, pizzaIds) && receivedPizza.bakeStatus === DraggablePizzaInstance.bakeStatus.WELL)
            AudioPlayer.order_correct();
        else
            AudioPlayer.distraction_hit();

        // Server validates pizza and updates points
        validatePizza(order, receivedPizza);

        receivedPizza.whenDraggedInOrder(this);
        order.stopAnimation();
        order.gameElement.remove();
        this.activeOrders.splice(this.activeOrders.indexOf(order), 1);
    }

    notifyExpired(order) {

        // Play sound
        AudioPlayer.order_expired();

        order.stopAnimation();
        order.gameElement.remove();
        this.activeOrders.splice(this.activeOrders.indexOf(order), 1);
    }
}

// --------------------------------------------------------------------

class AudioPlayer {

    static mash() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/mash_kürzer.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static fire() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/epic_fire.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static order_correct() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/order_correct.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static order_expired() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/order_expired.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static order_new() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/order_new.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static ingredient_hit() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/ingredient_hit.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static ingredient_finalHit() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/ingredient_finalHit.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static distraction_hit() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/distraction_hit.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static throw() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/ingredient_throw.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static ingredient_stamp() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/stamp_small.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static ingredient_finalStamp() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/stamp_big.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static trashcan() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/trashcan.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static round_lastFive() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/round_lastFive.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }

    static round_end() {
        const sound = document.createElement("AUDIO");
        sound.setAttribute('src', "/assets/sounds/round_end.wav");
        sound.setAttribute('type', "audio/wav");
        sound.volume = 0.4;
        sound.play();
    }
}

class AbstractCountdown {

    durationInSeconds;
    secondsPassed;
    affectedObject;

    constructor(durationInSeconds, affectedObject) {
        this.durationInSeconds = durationInSeconds;
        this.secondsPassed = 0;

        this.affectedObject = affectedObject;

    }

    // do not override this method
    startCountdown() {
        this.onCountdownStart(); // behavior to be specified in concrete class

        // Update the countdown every 1 second
        let x = setInterval(() => {
            this.secondsPassed += 1;

            if (this.secondsPassed >= this.durationInSeconds) {
                this.onCountdownEnd(); // behavior to be specified in concrete class
                clearInterval(x);

            } else {
                this.onCountdownInterval() // behavior to be specified in concrete class
            }
        }, 1000); // 1000 millisecond (= 1 second) interval
    }

    // Override this method in concrete class
    onCountdownStart() {
        alert("onCountdownStart() hasn't been overridden for this countdown type")
    }

    // Override this method in concrete class
    onCountdownInterval() {
        alert("onCountdownInterval() hasn't been overridden for this countdown type")
    }

    // Override this method in concrete class
    onCountdownEnd() {
        alert("onCountdownEnd() hasn't been overridden for this countdown type")
    }
}
