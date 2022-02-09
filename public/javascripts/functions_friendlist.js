let viewOnly = false;           //falls Profil vom Freund angeklickt wird ist dieses Attribut true

function getFriendsData() {
    document.getElementById("loading_friends").style.display = "block" //loading friends anzeigen
    document.getElementById("container_friends").style.overflowY = "hidden"; //scrollbar hiden, und erst nach der Erstellung der Freundesliste anzeigen
    fetch("/getFriendsData")
        .then(result => result.json())
        .then(result => createFriendlist(result));
}

function friendGetFriendsData(username) {
    document.getElementById("loading_friends").style.display = "block" //loading friends anzeigen
    document.getElementById("container_friends").style.overflowY = "hidden"; //scrollbar hiden, und erst nach der Erstellung der Freundesliste anzeigen
    fetch("/friendGetFriendsData", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.json())
        .then(result => createFriendlist(result));
}

function createFriendlist(data) {
    const list = document.createElement(`ul`);
    list.className = `friend-list`;
    for (let userName in data) {
        const friend = document.createElement(`li`);
        friend.className = `friend`;
        friend.onclick = function () {
            setupInformationFromFriend(this)
        };
        friend.onmouseover = function () {
            beginHoverEffect(this)
        };
        friend.onmouseleave = function () {
            endHoverEffect(this)
        };

        const image = document.createElement(`img`);
        if (data[userName] != null) {
            image.src = data[userName]
        } else image.src = "assets/images/profile-icon.png"

        //Element erstellen, um HoverText anzuzeigen
        const hoverText = document.createElement(`div`);
        hoverText.className = `hoverText`;
        hoverText.innerHTML = "Profil anschauen";
        hoverText.style.display = "none";

        const name = document.createElement(`div`);
        name.className = `name`;
        name.innerHTML = userName;
        friend.appendChild(image)
        friend.appendChild(name);
        friend.appendChild(hoverText);
        list.appendChild(friend);
    }
    document.getElementById("container_friends").append(list);

    document.getElementById("loading_friends").style.display = "none"; //loading friends hiden
    document.getElementById("container_friends").style.overflowY = "auto";  //erst hier scrollbar einfügen, damit sie nicht buggt
}

function beginHoverEffect(elm) {
    if (!viewOnly) {
        elm.style.backgroundColor = "black";
        elm.childNodes[1].style.display = "none"; //childnodes[1] gibt das "name" child von friend
        let hoverText = elm.childNodes[2];     //childnodes[2] gibt das "hoverText" child von friend
        hoverText.style.display = "block";
        hoverText.style.fontSize = "1.3em";
        hoverText.style.color = "white";
    }
}

function endHoverEffect(elm) {
    if (!viewOnly) {
        elm.style.backgroundColor = "#dbdbdb";
        elm.childNodes[2].style.display = "none";
        let name = elm.childNodes[1];
        name.style.display = "block";
    }
}

function addFriend() {
    const username = document.getElementById("addFriendInput").value;

    fetch("/profile/addFriend", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.text())
        .then(data => {
            let msg = data.toString();
            if (msg === "username not valid") {
                document.getElementById("addFriendInput").style.borderColor = "red";
            } else {
                deleteOldFriendList();
                getFriendsData();
                document.getElementById("addFriendInput").value = '';
                document.getElementById("addFriendInput").style.borderColor = "black";
            }
        })
}
