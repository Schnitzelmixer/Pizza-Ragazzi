let fruitNinjaRunning = false;
let whackAMoleRunning = false;

function startFromChoppingTable() {

    const ingredientsToPlayWith = [];
    const cuttingSurface = document.getElementById("cuttingSurface");

    cuttingSurface.setAttribute("style", "outline: ");

    for (let i = 0; i < existingDraggableIngredientInstances.length; i++) {
        const current = existingDraggableIngredientInstances[i];

        if (checkOverlap(current.draggable, document.getElementById("cuttingSurface"))) {

            if (!current.instanceOf(ChoppingIngredient)) {

                cuttingSurface.setAttribute("style", "outline: 4px solid red");
                return;
            }

            if (current.instanceOf(ChoppingIngredient) &&
                current.status === DraggableIngredientInstance.Status.RAW) {

                ingredientsToPlayWith.push(current);
            }
        }
    }

    if (ingredientsToPlayWith.length > 0)
        startMiniGame(ingredientsToPlayWith);
}

function startFromStampingTable() {

    const ingredientsToPlayWith = [];
    const stampingSurface = document.getElementById("smashingSurface");

    stampingSurface.setAttribute("style", "outline: ");

    for (let i = 0; i < existingDraggableIngredientInstances.length; i++) {
        const current = existingDraggableIngredientInstances[i];

        if (checkOverlap(current.draggable, document.getElementById("smashingSurface"))) {

            if (!current.instanceOf(StampingIngredient)) {

                stampingSurface.setAttribute("style", "outline: 4px solid red");
                return;
            }

            if (current.instanceOf(StampingIngredient) &&
                current.status === DraggableIngredientInstance.Status.RAW) {

                ingredientsToPlayWith.push(current);
            }
        }
    }

    if (ingredientsToPlayWith.length > 0)
        startMiniGame(ingredientsToPlayWith);
}

// all functionality for both mini games
function startMiniGame(ingredientList) {

    const processedIngredients = []; // type: DraggableIngredientInstance


    // CREATE THE GAME WINDOW -----------------------------------------------------------------------------------------

    const miniGame_window = document.getElementById("miniGame_window");

    const playArea = document.getElementById("miniGame_playArea");

    const sideBar = document.getElementById("miniGame_sideBar");

    const counter = document.getElementById("miniGame_sideBar_counter");
    updateCounter();
    sideBar.appendChild(counter);

    const closeButton = document.getElementById("miniGame_sideBar_closeButton");
    sideBar.appendChild(closeButton);

    const canvas = document.getElementById("miniGame_canvas")
    const context = canvas.getContext("2d");
    playArea.appendChild(canvas);

    miniGame_window.appendChild(playArea);
    miniGame_window.appendChild(sideBar);
    document.getElementById("miniGame_layer").appendChild(miniGame_window);


    if (ingredientList[0].parentIngredient instanceof ChoppingIngredient)
        fruit_ninja();
    else if (ingredientList[0].parentIngredient instanceof StampingIngredient)
        whackAMole();


    // UTILITY FUNCTIONS ----------------------------------------------------------------------------------------------

    function setCanvasSize() {
        const playArea_box = playArea.getBoundingClientRect();
        canvas.setAttribute('height', playArea_box.height + "px");
        canvas.setAttribute('width', playArea_box.width + "px");
    }

    function updateCounter() {
        counter.innerHTML = "" + processedIngredients.length + "/" + ingredientList.length;
    }

    // ----------------------------------------------------------------------------------------------------------------

    // display the game window
    document.getElementById("miniGame_layer").style.visibility = "visible";


    function fruit_ninja() {
        fruitNinjaRunning = true;

        // an instance of this class handles the throw of ONE ingredient
        class AbstractThrower {

            // ATTRIBUTES -----------------

            // stays the same for every throw
            draggableIngredient;
            ingredient_image;
            context;

            kurtosis; // defines how wide or narrow the parable trajectory is
            speed; // self explanatory [no specific value]
            rotation_increment; // speed of rotation [in degrees]


            // changes for every throw
            vertex_x_inPercent; // x-coordinate of highpoint of the throw-trajectory [in percent of canvas.width]
            vertex_y_inPercent; // y-coordinate of highpoint of the throw-trajectory [in percent of canvas.height]

            // changes constantly DURING throw
            x = -100;
            y = 0;
            rotation = 0;

            // -----
            ingredientJuggler


            constructor(draggableIngredient, context) {
                this.draggableIngredient = draggableIngredient;
                this.context = context;

                this.kurtosis = 0.05;
                this.speed = draggableIngredient.parentIngredient.flight_behavior.speed;
                this.rotation_increment = draggableIngredient.parentIngredient.flight_behavior.rotation;
            }


            newThrow() {

                this.defineNewTrajectory();
                this.startThrow();
            }

            // this method sets up all variables for the next throw
            defineNewTrajectory() {

                // prepare values for next throw --------------------

                // new coordinates of highpoint
                this.vertex_x_inPercent = this.randomize(this.draggableIngredient.parentIngredient.flight_behavior.vertex_x_inPercent, gameProperties.fruitNinja_xRange);
                this.vertex_y_inPercent = this.randomize(this.draggableIngredient.parentIngredient.flight_behavior.vertex_y_inPercent, gameProperties.fruitNinja_yRange);
                this.rotation = 0;

                // set the initial x to the value where y is 100px under the canvas
                // this is to prevent the trajectory from starting extremely far off screen
                this.x = this.parableYGiven(
                    canvas.height + 100,
                    this.kurtosis,
                    canvas.width * (this.vertex_x_inPercent / 100),
                    canvas.height * (1 - (this.vertex_y_inPercent / 100))
                )


                // randomly set flight direction (left -> right / right <- left)
                if (Math.random() > 0.5) { // 50:50
                    this.speed = -1 * this.draggableIngredient.parentIngredient.flight_behavior.speed; // element will fly reversed
                    this.x = canvas.width * (this.vertex_x_inPercent / 100) + (canvas.width * (this.vertex_x_inPercent / 100) - this.x);
                } else {
                    this.speed = this.draggableIngredient.parentIngredient.flight_behavior.speed;
                    // leave this.x as it is
                }
                this.x = Math.max(this.x, -100);
                this.x = Math.min(this.x, canvas.width + 100)

                // randomly set rotation direction
                if (Math.random() > 0.5) // 50:50
                    this.rotation_increment = -this.draggableIngredient.parentIngredient.flight_behavior.rotation;
                else
                    this.rotation_increment = this.draggableIngredient.parentIngredient.flight_behavior.rotation;
            }

            startThrow() {
            }

            endThrow() {
            }

            // calculate next position and draw on canvas
            step() {

                // calculating y with parable function
                this.y = this.parableXGiven(
                    this.x,
                    this.kurtosis,
                    canvas.width * (this.vertex_x_inPercent / 100),
                    canvas.height * (1 - (this.vertex_y_inPercent / 100))
                );

                this.context.save();

                // set rotation center of canvas-context to coordinates of the ingredient
                this.context.translate(this.x, this.y);

                // rotate the canvas to the specified degrees
                this.context.rotate(this.rotation * Math.PI / 180);
                this.rotation = (this.rotation + this.rotation_increment) % 360;

                // draw the image
                // since the context is rotated, the image will be rotated as well
                this.context.drawImage(this.ingredient_image, -this.ingredient_image.width / 2, -this.ingredient_image.height / 2);
                //this.context.fillRect(-20, -20, 40, 40);

                this.context.restore();

                this.x += this.speed;

                if (this.y > canvas.height + 150 || this.x < -150 || this.x > canvas.width + 150)
                    this.endThrow();
            }

            isHit(cursorX, cursorY) {

                if (!this.wasHitInThisThrow)
                    return isInside([cursorX, cursorY], this.getShapeCoordinates());
                else
                    return false;
            }

            onHit() {
            }

            // form:  cur * (x - ver_x)^2 + ver_y
            parableXGiven(x, cur, ver_x, ver_y) {
                return cur * Math.pow(x - ver_x, 2) + ver_y;
            }

            // form:  -((x - ver_y)/cur)^0.5 + ver_x
            parableYGiven(y, cur, ver_x, ver_y) {
                return -Math.pow((y - ver_y) / cur, 0.5) + ver_x;
            }

            randomize(value, range) {

                const value_min = Math.max(value - range / 2, 10);
                const value_max = Math.min(value + range / 2, 90);

                const tmp = value_max - value_min; // Maximum value you can add to value_min

                return value_min + Math.random() * tmp; // 0 <= Math.random() < 1
            }

            getShapeCoordinates() {
                let lu = [this.x - this.ingredient_image.width / 2, this.y - this.ingredient_image.height / 2];
                let lo = [this.x - this.ingredient_image.width / 2, this.y + this.ingredient_image.height / 2];
                let ro = [this.x + this.ingredient_image.width / 2, this.y + this.ingredient_image.height / 2];
                let ru = [this.x + this.ingredient_image.width / 2, this.y - this.ingredient_image.height / 2];

                const shape = [lu, lo, ro, ru];

                return rotateCoordinates(shape, [this.x, this.y], this.rotation)
            }
        }

        class IngredientThrower extends AbstractThrower {

            // changes during play
            wasHitInThisThrow = false;
            hits_left; // how many hits until it is chopped


            constructor(draggableIngredient, context) {
                super(draggableIngredient, context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', draggableIngredient.picture_raw);

                this.hits_left = draggableIngredient.parentIngredient.flight_behavior.hits_required;
            }

            setupWithIngredientJuggler(juggler) {
                this.ingredientJuggler = juggler;
            }

            startThrow() {

                this.wasHitInThisThrow = false;

                // tell juggler, you can't be thrown again
                const index = this.ingredientJuggler.ingredientsWaitingToBeThrown.indexOf(this);
                this.ingredientJuggler.ingredientsWaitingToBeThrown.splice(index, 1);

                // tell juggler to either throw yourself OR a distraction
                if (Math.random() < gameProperties.fruitNinja_distractionChance_percent / 100)
                    this.ingredientJuggler.ingredientsCurrentlyInAir.push(this.createDistraction());
                else
                    this.ingredientJuggler.ingredientsCurrentlyInAir.push(this);

            }

            endThrow() {

                // tell juggler, you are ready to be thrown again
                const index = this.ingredientJuggler.ingredientsCurrentlyInAir.indexOf(this);
                this.ingredientJuggler.ingredientsCurrentlyInAir.splice(index, 1);
                this.ingredientJuggler.ingredientsWaitingToBeThrown.push(this);
            }

            onHit(callback) {

                this.wasHitInThisThrow = true;
                this.hits_left -= 1;

                document.body.style.cursor = `url("/assets/images/cursors/hitmarker.cur"),auto`
                setTimeout(resetCursor, gameProperties.fruitNinja_hitmarkerShowingTime * 1000)

                function resetCursor() {
                    if (fruitNinjaRunning) {
                        document.body.style.cursor = `url("/assets/images/cursors/knife.cur"),auto`;
                    } else {
                        document.body.style.cursor = `auto`;
                    }
                }

                /*
                window.requestAnimationFrame(function () {
                    context.fillStyle = '#79de43'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                });
                 */

                if (this.hits_left <= 0) {

                    AudioPlayer.ingredient_finalHit();
                    console.log("Final Hit: " + this.draggableIngredient.name);

                    this.ingredient_image.remove();
                    this.draggableIngredient.setStatus(DraggableIngredientInstance.Status.PROCESSED);

                    this.ingredientJuggler.dropIngredient(this);
                    processedIngredients.push(this.draggableIngredient);
                    updateCounter();
                } else {

                    AudioPlayer.ingredient_hit();
                    console.log("Hit: " + this.draggableIngredient.name);
                }
            }

            createDistraction() {

                return new DistractionThrower(this, gameProperties.fruitNinja_distractionDisablingTime * 1000);
            }
        }

        class DistractionThrower extends AbstractThrower {

            realIngredientThrower;
            disablingTime;

            constructor(ingredientThrower, disablingTime) {
                super(ingredientThrower.draggableIngredient, ingredientThrower.context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', ingredientThrower.draggableIngredient.parentIngredient.picture_raw_distraction);

                this.disablingTime = disablingTime;
                this.realIngredientThrower = ingredientThrower;
                this.ingredientJuggler = ingredientThrower.ingredientJuggler;

                this.defineNewTrajectory();
            }

            endThrow() {

                // tell juggler, the NON-distracting ingredient can be thrown again
                const index = this.ingredientJuggler.ingredientsCurrentlyInAir.indexOf(this);
                this.ingredientJuggler.ingredientsCurrentlyInAir.splice(index, 1);
                this.ingredientJuggler.ingredientsWaitingToBeThrown.push(this.realIngredientThrower);
            }

            onHit() {

                AudioPlayer.distraction_hit();

                window.requestAnimationFrame(function () {
                    context.fillStyle = '#ab0000'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                });

                console.log("Distraction Hit: " + this.draggableIngredient.name);
                this.ingredientJuggler.disableFor(this.disablingTime);

                this.ingredient_image.remove();
                this.endThrow();
            }
        }

        // this class is responsible for WHAT is thrown, and WHEN
        class IngredientJuggler {

            allIngredientsToJuggle = [];
            ingredientsWaitingToBeThrown = []
            ingredientsCurrentlyInAir = [];

            minTimeBetweenThrows;
            timestampLastThrow = 0;
            maxIngredientsInAir;

            disableTime = 0;
            lastTimestamp;

            constructor(ingredientList, minTimeBetweenThrows, maxIngredientsInAir) {
                this.minTimeBetweenThrows = minTimeBetweenThrows;
                this.maxIngredientsInAir = maxIngredientsInAir;

                for (let i = 0; i < ingredientList.length; i++) {
                    this.addIngredient(new IngredientThrower(ingredientList[i], context));
                    this.allIngredientsToJuggle[i].setupWithIngredientJuggler(this);
                }
            }

            addIngredient(ingredientThrower) {
                this.allIngredientsToJuggle.push(ingredientThrower);
                this.ingredientsWaitingToBeThrown.push(ingredientThrower);
            }

            dropIngredient(ingredientThrower) {
                this.allIngredientsToJuggle.splice(this.allIngredientsToJuggle.indexOf(ingredientThrower), 1);
                this.ingredientsCurrentlyInAir.splice(this.ingredientsCurrentlyInAir.indexOf(ingredientThrower), 1);
                if (this.ingredientsWaitingToBeThrown.includes(ingredientThrower))
                    this.ingredientsWaitingToBeThrown.splice(this.ingredientsWaitingToBeThrown.indexOf(ingredientThrower), 1);
            }

            nextFrame(timestamp) {

                if (this.disableTime > 0) {
                    this.disableTime -= timestamp - this.lastTimestamp;

                    context.fillStyle = '#e57d7d'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }

                this.lastTimestamp = timestamp;

                if ((timestamp - this.timestampLastThrow) > this.minTimeBetweenThrows * 1000)
                    if (this.ingredientsWaitingToBeThrown.length > 0 &&
                        this.ingredientsCurrentlyInAir.length < this.maxIngredientsInAir) {
                        const randomIndex = Math.floor(Math.random() * this.ingredientsWaitingToBeThrown.length);
                        this.ingredientsWaitingToBeThrown[randomIndex].newThrow();
                        this.timestampLastThrow = timestamp;
                    }

                const copy = [...this.ingredientsCurrentlyInAir];

                copy.forEach(function (item) {
                    item.step();
                });
            }

            isDisabled() {
                return this.disableTime > 0;
            }

            disableFor(milliseconds) {

                this.disableTime = milliseconds;
            }
        }

        // this class handles all user inputs while playing
        function addHitListener(ingredientJuggler) {

            let x;
            let y;

            canvas.onmousedown = startListening;

            function startListening(event) {
                event = event || window.event;
                event.preventDefault();

                document.body.style.cursor = `url("/assets/images/cursors/knife.cur"),auto`;

                document.onmouseup = stopListening;
                document.onmousemove = checkForHit;
            }

            function stopListening(event) {
                document.onmouseup = null;
                document.onmousemove = null;

                document.body.style.cursor = "auto";
            }

            function checkForHit(event) {
                if (ingredientJuggler.isDisabled())
                    return;

                const canvas_box = canvas.getBoundingClientRect();
                x = event.clientX - canvas_box.left;
                y = event.clientY - canvas_box.top;

                ingredientJuggler.ingredientsCurrentlyInAir.forEach(function (item) {
                    if (item.isHit(x, y)) {
                        item.onHit();
                    }
                })
            }
        }

        // ------------------------------------------------------------------------------------------------------------

        setCanvasSize();

        const ingredientJuggler = new IngredientJuggler(
            ingredientList,
            gameProperties.fruitNinja_minTimeBetweenThrows,
            gameProperties.fruitNinja_maxIngredientsInAir);

        addHitListener(ingredientJuggler);

        let start;

        function animationStep(timestamp) {
            if (start === undefined)
                start = timestamp;

            // clear the canvas before drawing the next frame
            context.clearRect(0, 0, canvas.width, canvas.height);

            // calculating & drawing next frame for every current throw
            ingredientJuggler.nextFrame(timestamp);

            if (ingredientJuggler.allIngredientsToJuggle.length <= 0)
                stopMiniGame();
            if (fruitNinjaRunning)
                window.requestAnimationFrame(animationStep);
        }

        window.requestAnimationFrame(animationStep); // initially start the game-animation
    }

    function whackAMole() {
        whackAMoleRunning = true;

        class AbstractShower {

            draggableIngredient;
            ingredient_image;
            context;

            show_duration;
            time_shown = 0;
            lastTimestamp = 0;

            // changes for every appearance
            holeNumber;

            moleHandler;


            constructor(element, context) {
                this.draggableIngredient = element;
                this.context = context;
            }

            newShow() {

                this.lastTimestamp = window.performance.now();
                this.time_shown = this.draggableIngredient.parentIngredient.stamp_behavior.display_time;
                this.defineNewShow();
                this.startShow();
            }

            defineNewShow() {

                // define in which hole to appear
                const randomIndex = Math.floor(Math.random() * this.moleHandler.freeHoles.length);
                this.holeNumber = moleHandler.freeHoles[randomIndex];
            }

            startShow() {

                // tell MoleHandler, your hole is occupied
                //this.moleHandler.freeHoles.splice(this.holeNumber, 1);
                const index = this.moleHandler.freeHoles.indexOf(this.holeNumber);
                this.moleHandler.freeHoles.splice(index, 1);
            }

            endShow() {

                // tell MoleHandler, your hole is now free again
                //this.moleHandler.freeHoles.splice(this.holeNumber, 0, this.holeNumber);
                this.moleHandler.freeHoles.push(this.holeNumber);
                this.holeNumber = undefined;
            }

            step(timestamp) {

                this.time_shown -= timestamp - this.lastTimestamp;
                this.lastTimestamp = timestamp;

                this.moleHandler.moleDrawer.drawInHole(this.holeNumber, this.ingredient_image);

                if (this.time_shown <= 0) {
                    this.endShow();
                }
            }

            isHit(cursorX, cursorY) {
                return isInside([cursorX, cursorY], this.getShapeCoordinates());
            }

            onHit() {
            }

            getShapeCoordinates() {
                const holeCoordinates = this.moleHandler.moleDrawer.holeCoordinates[this.holeNumber];

                let lu = [holeCoordinates[0] - this.ingredient_image.width / 2, holeCoordinates[1] - this.ingredient_image.height / 2];
                let lo = [holeCoordinates[0] - this.ingredient_image.width / 2, holeCoordinates[1] + this.ingredient_image.height / 2];
                let ro = [holeCoordinates[0] + this.ingredient_image.width / 2, holeCoordinates[1] + this.ingredient_image.height / 2];
                let ru = [holeCoordinates[0] + this.ingredient_image.width / 2, holeCoordinates[1] - this.ingredient_image.height / 2];

                return [lu, lo, ro, ru];
            }
        }

        class IngredientShower extends AbstractShower {

            hits_left;


            constructor(draggableIngredient, context) {
                super(draggableIngredient, context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', draggableIngredient.picture_raw);

                this.hits_left = draggableIngredient.parentIngredient.stamp_behavior.hits_required;
            }

            setupWithMoleHandler(handler) {
                this.moleHandler = handler;
            }

            startShow() {
                super.startShow();

                // tell MoleHandler, you can't be shown again
                let index = this.moleHandler.ingredientsWaitingToBeShown.indexOf(this);
                this.moleHandler.ingredientsWaitingToBeShown.splice(index, 1);

                // tell MoleHandler to either show yourself OR a distraction
                if (Math.random() < gameProperties.whack_distractionChance_percent / 100)
                    this.moleHandler.ingredientsCurrentlyShown.push(this.createDistraction());
                else
                    this.moleHandler.ingredientsCurrentlyShown.push(this);
            }

            endShow() {
                super.endShow();

                // tell MoleHandler, you are ready to be shown again
                const index = this.moleHandler.ingredientsCurrentlyShown.indexOf(this);
                this.moleHandler.ingredientsCurrentlyShown.splice(index, 1);
                this.moleHandler.ingredientsWaitingToBeShown.push(this);
            }

            onHit() {
                this.endShow();

                document.body.style.cursor = `url("/assets/images/cursors/hitmarker.cur"),auto`
                this.hits_left -= 1;

                if (this.hits_left <= 0) {

                    AudioPlayer.ingredient_finalStamp();
                    console.log("Final Hit: " + this.draggableIngredient.name);

                    this.ingredient_image.remove();
                    this.draggableIngredient.setStatus(DraggableIngredientInstance.Status.PROCESSED);

                    this.moleHandler.dropIngredient(this);

                    if (this.draggableIngredient.name === "Impasto") {
                        const newPizza = new DraggablePizzaInstance();
                        alignDraggableToDestination(newPizza.draggable, this.draggableIngredient.draggable);
                        this.draggableIngredient.delete();
                    }
                    processedIngredients.push(this.draggableIngredient);
                    updateCounter();
                } else {
                    AudioPlayer.ingredient_stamp();
                    console.log("Hit: " + this.draggableIngredient.name)
                }
            }

            createDistraction() {

                return new DistractionShower(this);
            }
        }

        class DistractionShower extends AbstractShower {

            disabling_time;
            display_time;

            realIngredientShower;

            constructor(ingredientShower) {
                super(ingredientShower.draggableIngredient, ingredientShower.context);

                this.ingredient_image = document.createElement('img');
                this.ingredient_image.setAttribute('src', ingredientShower.draggableIngredient.parentIngredient.picture_raw_distraction);

                // copy variables of real ingredientShower
                this.time_shown = ingredientShower.time_shown;
                this.lastTimestamp = ingredientShower.lastTimestamp
                this.holeNumber = ingredientShower.holeNumber;
                this.moleHandler = ingredientShower.moleHandler;

                this.disabling_time = ingredientShower.draggableIngredient.parentIngredient.stamp_behavior.disabling_time;
                this.display_time = ingredientShower.draggableIngredient.parentIngredient.stamp_behavior.display_time;
                this.realIngredientShower = ingredientShower;
            }

            endShow() {
                super.endShow();

                // tell MoleHandler, the NON-distracting ingredient can be shown again
                const index = this.moleHandler.ingredientsCurrentlyShown.indexOf(this);
                this.moleHandler.ingredientsCurrentlyShown.splice(index, 1);
                this.moleHandler.ingredientsWaitingToBeShown.push(this.realIngredientShower);
            }

            onHit() {

                AudioPlayer.distraction_hit(); // TODO: Change this

                window.requestAnimationFrame(function () {
                    context.fillStyle = '#ab0000'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                });

                console.log("Distraction Hit: " + this.draggableIngredient.name);
                this.moleHandler.disableFor(this.disabling_time);

                this.ingredient_image.remove();
                this.endShow();
            }
        }

        // this class is responsible for WHAT is shown, and WHEN
        class MoleHandler {

            allIngredientsInPlay = [];
            ingredientsWaitingToBeShown = [];
            ingredientsCurrentlyShown = [];

            freeHoles = [];

            numberOfHoles;
            minDistanceBetweenShows;
            timestampLastShow = 0;
            maxIngredientsShownAtOnce;

            disableTime = 0;
            lastTimestamp;

            moleDrawer;

            constructor(ingredientList, numberOfHoles, minDistanceBetweenShows, maxIngredientsShownAtOnce) {
                this.numberOfHoles = numberOfHoles;
                this.moleDrawer = new MoleDrawer(numberOfHoles, canvas, context);

                this.minDistanceBetweenShows = minDistanceBetweenShows;
                this.maxIngredientsShownAtOnce = maxIngredientsShownAtOnce;

                for (let i = 0; i < numberOfHoles; i++) {
                    this.freeHoles.push(i);
                }

                for (let i = 0; i < ingredientList.length; i++) {
                    this.addIngredient(new IngredientShower(ingredientList[i]));
                    this.allIngredientsInPlay[i].setupWithMoleHandler(this);
                }
            }

            addIngredient(ingredientShower) {
                this.allIngredientsInPlay.push(ingredientShower);
                this.ingredientsWaitingToBeShown.push(ingredientShower);
            }

            dropIngredient(ingredientShower) {
                this.allIngredientsInPlay.splice(this.allIngredientsInPlay.indexOf(ingredientShower), 1);
                if (this.ingredientsCurrentlyShown.includes(ingredientShower))
                    this.ingredientsCurrentlyShown.splice(this.ingredientsCurrentlyShown.indexOf(ingredientShower), 1);
                if (this.ingredientsWaitingToBeShown.includes(ingredientShower))
                    this.ingredientsWaitingToBeShown.splice(this.ingredientsWaitingToBeShown.indexOf(ingredientShower), 1);
            }

            nextFrame(timestamp) {

                if (this.disableTime > 0) {
                    this.disableTime -= timestamp - this.lastTimestamp

                    context.fillStyle = '#e57d7d'
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }

                this.moleDrawer.drawEmpty();

                this.lastTimestamp = timestamp;

                if ((timestamp - this.timestampLastShow) > this.minDistanceBetweenShows)
                    if (this.ingredientsWaitingToBeShown.length > 0 &&
                        this.ingredientsCurrentlyShown.length < this.maxIngredientsShownAtOnce) {
                        const randomIndex = Math.floor(Math.random() * this.ingredientsWaitingToBeShown.length);
                        this.ingredientsWaitingToBeShown[randomIndex].newShow();
                        this.timestampLastShow = timestamp;
                    }

                const copy = [...this.ingredientsCurrentlyShown];

                copy.forEach(function (item) {
                    item.step(timestamp);
                });
            }

            isDisabled() {
                return this.disableTime > 0;
            }

            disableFor(milliseconds) {

                this.disableTime = milliseconds;
            }
        }

        class MoleDrawer {

            numberOfHoles;
            holeSize = 200;
            gapSize = 20;

            canvas;
            context;

            holeCoordinates = [];

            constructor(numberOfHoles, canvas, context) {
                this.numberOfHoles = numberOfHoles;
                this.canvas = canvas;
                this.context = context;

                this.determineCoordinates();
            }

            determineCoordinates() {

                const side = this.holeSize * 3 + this.gapSize * 2;
                const topGap = (canvas.height - side) / 2;
                const leftGap = (canvas.width - side) / 2;

                let x = leftGap;
                let y = topGap;

                for (let i = 0; i < 3; i++) {
                    y += this.holeSize / 2

                    for (let j = 0; j < 3; j++) {
                        x += this.holeSize / 2

                        this.holeCoordinates.push([x, y]);

                        x += this.gapSize;
                        x += this.holeSize / 2;
                    }

                    x = leftGap;
                    y += this.gapSize;
                    y += this.holeSize / 2;
                }
            }

            drawEmpty() {

                for (let i = 0; i < this.holeCoordinates.length; i++) {

                    context.beginPath();
                    context.arc(this.holeCoordinates[i][0], this.holeCoordinates[i][1], this.holeSize / 2, 0, 2 * Math.PI, false);
                    context.lineWidth = 10;
                    context.strokeStyle = '#000000';
                    context.stroke();
                }


            }

            drawInHole(holeNumber, image) {
                let widthScaleFactor = 1
                let heightScaleFactor = 1
                if (image.width > image.height)
                    heightScaleFactor = image.height / image.width;
                else
                    widthScaleFactor = image.width / image.height;

                context.save();
                context.translate(this.holeCoordinates[holeNumber][0], this.holeCoordinates[holeNumber][1]);
                context.drawImage(image, -(this.holeSize * widthScaleFactor / 2), -(this.holeSize * heightScaleFactor / 2), this.holeSize * widthScaleFactor, this.holeSize * heightScaleFactor);
                context.restore();
            }
        }

        function addHitListener(moleHandler) {

            let x;
            let y;

            canvas.onmousedown = checkForHit;
            //canvas.onmousedown.apply(document.body.style.cursor= `url("/assets/images/cursors/rollingPin.cur"),auto`);
            canvas.onmouseup = switchCursorToNormal;

            function switchCursorToNormal(event) {
                document.body.style.cursor = "auto";
            }

            function checkForHit(event) {
                document.body.style.cursor = `url("/assets/images/cursors/rollingPin.cur"),auto`;
                if (moleHandler.isDisabled())
                    return;

                const canvas_box = canvas.getBoundingClientRect();
                x = event.clientX - canvas_box.left;
                y = event.clientY - canvas_box.top;

                moleHandler.ingredientsCurrentlyShown.forEach(function (item) {
                    if (item.isHit(x, y))
                        item.onHit();
                })
            }
        }

        // ------------------------------------------------------------------------------------------------------------

        setCanvasSize();


        const moleHandler = new MoleHandler(
            ingredientList,
            9,
            gameProperties.whack_minTimeBetweenShows * 1000,
            gameProperties.whack_maxIngredientsShownAtOnce);

        addHitListener(moleHandler);

        let start;

        function animationStep(timestamp) {
            if (start === undefined)
                start = timestamp;

            // clear the canvas before drawing the next frame
            context.clearRect(0, 0, canvas.width, canvas.height);

            moleHandler.nextFrame(timestamp);

            if (moleHandler.allIngredientsInPlay.length <= 0)
                stopMiniGame();
            if (whackAMoleRunning)
                window.requestAnimationFrame(animationStep);
        }

        window.requestAnimationFrame(animationStep); // initially start the game-animation
    }

}

function stopMiniGame() {
    fruitNinjaRunning = false;
    whackAMoleRunning = false;
    document.body.style.cursor = "auto";

    document.getElementById("miniGame_layer").style.visibility = "hidden";
}