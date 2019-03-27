
function getSeat(tableId, isSecondPlayer) {
    //here we get id from some html object
    let id = "KamilTest";
    firebase.database().ref("players/" + id + "/table").set(tableId);
    let tablePlayer;
    if (isSecondPlayer) {
        tablePlayer = "/player2";
    } else {
        tablePlayer = "/player1";
    }
    firebase.database().ref("/tables/" + tableId + tablePlayer).set(id);

}

function getAvailableTable(getSeat) {
    firebase.database().ref("/tables").once("value", function (snap) {
        let freeTableId = "";
        for (let tableId of Object.keys(snap.val())) {
            if (!snap.val()[tableId].hasOwnProperty("player2")) {
                freeTableId = tableId;
            }
        }
        if (freeTableId === "") {
            createNewTable().then(function (freeTableId) {
                getSeat(freeTableId, false);
            });
        } else {
            getSeat(freeTableId, true);
        }
    });
}

function createNewTable() {
    return firebase.database().ref("/tables").push().then(
        function (ref) {
            return ref.key;
        }
    );
}

getAvailableTable(getSeat);