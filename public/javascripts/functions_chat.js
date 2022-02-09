let chatPartner;
let chatMessages;

function setupChatStuff(username) {
    if (username !== chatPartner) {    //nur wenn neuer Name eingegeben wurde, wird gefetcht
        document.getElementById("loading_messages").style.display = "block"; //ladesymbol anzeigen
        getMessagesFromDatabase(username, true);
    }
}

function getMessagesFromDatabase(username, forceExecution) {  //forceExecution für seltenen bug, bei dem der fetch läuft, währenddessen aber ein neuer Chat geöffnet wird
    fetch("/profile/getMessages", {
        method: 'POST',
        body: JSON.stringify(username),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include'
    }).then(result => result.json())
        .then(function (result) {
            if (username === chatPartner) {
                appendRetrievedMessageToChat(result, username); //neue eingetroffene Nachricht appenden
            } else {
                if (forceExecution) {
                    displayChatMessages(result, username);  //gesamten Chat laden
                }
            }
        });
}

function sendMessage(message, time) {
    if (message !== "") {
        document.getElementById("sendMessageInput").value = ""; //Input clearen
        appendSentMessageToChat(message, time);
        //automatically scroll down
        let chat_div = document.getElementById("chatMessages_div");
        chat_div.scrollTo(0, chat_div.scrollHeight);

        fetch("/profile/sendMessage", {
            method: 'POST',
            body: JSON.stringify({
                receiver: chatPartner,
                message_text: message,
                time: time
            }),
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include'
        })
    }
}

function appendSentMessageToChat(message, time) {
    const container = document.createElement('div');

    const content = document.createElement('p');
    content.textContent = message;

    const timeSpan = document.createElement('span');
    const date = new Date(time);
    timeSpan.textContent = date.toLocaleTimeString() + " " + date.toLocaleDateString();

    container.setAttribute('class', 'container darker');
    timeSpan.setAttribute('class', 'time-left');

    container.appendChild(content);
    container.appendChild(timeSpan);
    document.getElementById("chatMessages_div").appendChild(container);
}

function appendRetrievedMessageToChat(messages, user2Username) {
    if (messages != null && messages !== 'undefined') {
        const newMessages = checkIfRetrievedNewMessagesAndReturnThem(messages, user2Username); //gibt Neue retrieved messages zurück

        if (newMessages.length > 0) {      //wenn neue Message eingetroffen ist
            chatMessages = messages;   //message-Array aktualisieren

            //Display Messages
            newMessages.forEach(function (item) {
                const container = document.createElement('div');

                const content = document.createElement('p');
                content.textContent = item.message_text;

                const timeSpan = document.createElement('span');
                const date = new Date(item.time);
                timeSpan.textContent = date.toLocaleTimeString() + " " + date.toLocaleDateString();

                container.setAttribute('class', 'container');
                timeSpan.setAttribute('class', 'time-right');

                container.appendChild(content);
                container.appendChild(timeSpan);
                document.getElementById("chatMessages_div").appendChild(container);

                //automatically scroll down
                let chat_div = document.getElementById("chatMessages_div");
                chat_div.scrollTo(0, chat_div.scrollHeight);
            });
        }
    }
}

function checkIfRetrievedNewMessagesAndReturnThem(messages, user2Username) {
    const newMessagesRetrieved = [];

    for (let i = chatMessages.length; i < messages.length; i++) {
        if (messages[i].senderName.toLowerCase() === user2Username.toLowerCase()) {
            newMessagesRetrieved.push(messages[i]);
        }
    }
    return newMessagesRetrieved;
}

function refreshChat() {
    window.setInterval(function () {
        if (chatPartner !== undefined && chatPartner !== null && !viewOnly) {
            getMessagesFromDatabase(chatPartner, false);
        }
    }, 2000);
}

function displayChatMessages(messages, user2Username) {
    if (messages != null && messages !== 'undefined') {
        chatPartner = user2Username;  //chatPartner-Variable in Zeile 1 zuweisen
        chatMessages = messages;

        document.getElementById("chatMessages_div").innerHTML = ''; //alten Chat löschen

        document.getElementById("chatWithWhoInput").style.borderColor = "black"; //roten Rand des Inputs entfernen, falls er da war
        document.getElementById("chat_heading").textContent = "Chat mit " + user2Username.toString().toUpperCase();  //Überschrift mit Username2
        //SendeInput und SendeButton anzeigen
        document.getElementById("sendMessageInput").style.display = "inline";
        document.getElementById("sendMessageButton").style.display = "inline";

        //Display Messages
        messages.forEach(function (item) {
            const container = document.createElement('div');

            const content = document.createElement('p');
            content.textContent = item.message_text;

            const timeSpan = document.createElement('span');
            const date = new Date(item.time);
            timeSpan.textContent = date.toLocaleTimeString() + " " + date.toLocaleDateString();

            if (item.senderName.toLowerCase() === user2Username.toLowerCase()) {  //falls ausgewählter Freund Nachricht gesendet hat
                container.setAttribute('class', 'container');
                timeSpan.setAttribute('class', 'time-right');
            } else {
                container.setAttribute('class', 'container darker');
                timeSpan.setAttribute('class', 'time-left');
            }

            container.appendChild(content);
            container.appendChild(timeSpan);
            document.getElementById("chatMessages_div").appendChild(container);

            //automatically scroll down
            let chat_div = document.getElementById("chatMessages_div");
            chat_div.scrollTo(0, chat_div.scrollHeight);
        });
        document.getElementById("loading_messages").style.display = "none";
    } else {  //nicht befreundet oder Übergabeparameter == null
        document.getElementById("loading_messages").style.display = "none";
        document.getElementById("chatWithWhoInput").style.borderColor = "red"; //roten Rand beim Input hinzufügen
    }
}