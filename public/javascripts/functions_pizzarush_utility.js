// drag functionality
function makeDraggable(element) {
    let diff_x = 0, diff_y = 0, x = 0, y = 0;

    if (!(element instanceof DraggableIngredientInstance || element instanceof DraggablePizzaInstance))
        alert("this element is not a DraggableIngredientInstance or a DraggablePizzaInstance");

    // if element is pressed down -> start dragging
    element.draggable.onmousedown = initiateDrag;

    function initiateDrag(event) {
        if (!element.isDragEnabled)
            return;

        if (element.isInOven)
            element.ovenOut();

        event = event || window.event;
        event.preventDefault();

        // get the mouse cursor position at startup:
        x = event.clientX;
        y = event.clientY;
        document.onmouseup = endDrag;

        // calls function whenever the cursor moves:
        document.onmousemove = updateDragPosition;
    }

    function updateDragPosition(event) {
        event = event || window.event;
        event.preventDefault();

        // calculate the new cursor position:
        diff_x = x - event.clientX;
        diff_y = y - event.clientY;
        x = event.clientX;
        y = event.clientY;

        // set the element's new position:
        element.draggable.style.top = (element.draggable.offsetTop - diff_y) + "px";
        element.draggable.style.left = (element.draggable.offsetLeft - diff_x) + "px";
    }


    // defines what to do when element is released
    function endDrag(event) {
        event = event || window.event;
        event.preventDefault();

        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;

        checkIfDraggedInTrash();

        if (element instanceof DraggableIngredientInstance && element.status === DraggableIngredientInstance.Status.PROCESSED)
            checkIfDraggedInPizza(); // check overlap with every existing pizza

        else if (element instanceof DraggablePizzaInstance) {
            checkIfDraggedInOven(); // check overlap with every oven
            checkIfDraggedInOrder(); // check overlap with every order element
        }
    }

    // -------------------------------

    function checkIfDraggedInOrder() {

        const activeOrders = OrderHandler.getInstance().activeOrders;

        activeOrders.forEach(function (item) {
            if (checkOverlap(element.draggable, item.gameElement)) {

                OrderHandler.getInstance().notifyDelivered(item, element);
            }
        });
    }

    function checkIfDraggedInPizza() {
        existingDraggablePizzaInstances.forEach(function (currentPizza) {

            if (currentPizza.timeInOvenInMilliseconds < 1.5 * 1000) // you can only assemble (nearly) raw pizzas -> prevents cheating
                if (checkOverlap(element.draggable, currentPizza.draggable))
                    element.whenDraggedInPizza(currentPizza);
        });
    }

    function checkIfDraggedInOven() {
        ovenList.forEach(function (item) {

            if (checkOverlap(element.draggable, item.gameElement.image)) {

                element.whenDraggedInOven(item);
            }
        });
    }

    function checkIfDraggedInTrash() {
        if (checkOverlap(element.draggable, document.getElementById("trash"))) {
            AudioPlayer.trashcan();
            element.delete();
        }
    }
}

// get a new raw ingredient
function pullNewIngredient(ingredientIndex) {
    const draggable = availableIngredients[ingredientIndex].createDraggableInstance().draggable;
    const event = window.event;
    event.preventDefault();

    // set element position to cursor. Teig wird direkt als angefangene Pizza erstellt, deshalb anders behandelt
    draggable.style.left = draggable.tagName === "IMG" ? event.clientX + scrollX - draggable.width / 2 + "px" : event.clientX + scrollX - draggable.firstChild.width / 2 + "px";
    draggable.style.top = draggable.tagName === "IMG" ? event.clientY + scrollY - draggable.height / 2 + "px" : event.clientY + scrollY - draggable.firstChild.height / 2 + "px";
}

function checkOverlap(draggable, destination) {
    const draggable_box = draggable.getBoundingClientRect();
    const destination_box = destination.getBoundingClientRect();

    //center-coordinates of the draggable element
    const draggable_centerX = draggable_box.left + (draggable_box.right - draggable_box.left) / 2;
    const draggable_centerY = draggable_box.top + (draggable_box.bottom - draggable_box.top) / 2;

    //are they overlapping in X or Y ?
    const isOverlapX = (draggable_centerX > destination_box.left && draggable_centerX < destination_box.right);
    const isOverlapY = (draggable_centerY > destination_box.top && draggable_centerY < destination_box.bottom);

    return isOverlapX && isOverlapY;
}

function alignDraggableToDestination(draggable, destination) {

    const draggable_box = draggable.getBoundingClientRect();
    const destination_box = destination.getBoundingClientRect();

    const x = destination_box.left + (destination_box.width - draggable_box.width) / 2
    const y = destination_box.top + (destination_box.height - draggable_box.height) / 2

    //Align pizza and oven position
    draggable.style.left = x + "px";
    draggable.style.top = y + "px";
}

function rotateCoordinates(shape, pivot, angle) {

    // translate coordinates so that pivot is at 0x0
    for (let i = 0; i < shape.length; i++) {
        shape[i][0] -= pivot[0];
        shape[i][1] -= pivot[1];
    }

    // rotation around 0x0
    for (let i = 0; i < shape.length; i++) {
        const tmp = [];
        tmp[0] = shape[i][0] * Math.cos(angle) - shape[i][1] * Math.sin(angle);
        tmp[1] = shape[i][1] * Math.cos(angle) + shape[i][0] * Math.sin(angle);

        shape[i][0] = tmp[0];
        shape[i][1] = tmp[1];
    }

    // translate coordinates so that pivot is back in original position
    for (let i = 0; i < shape.length; i++) {
        shape[i][0] += pivot[0]
        shape[i][1] += pivot[1]
    }

    return shape;
}

function isInside(point, shape) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

    const x = point[0], y = point[1];

    let inside = false;
    for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
        const xi = shape[i][0], yi = shape[i][1];
        const xj = shape[j][0], yj = shape[j][1];

        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}
