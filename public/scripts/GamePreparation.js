
function getSeat(tableId, isSecondPlayer) {
    let id = JSON.parse(localStorage.getItem("userData"))["name"];
    firebase.database().ref("players/" + id + "/table").set(tableId);
    let tablePlayer;
    if (isSecondPlayer) {
        tablePlayer = "player2";
    } else {
        tablePlayer = "player1";
    }
    firebase.database().ref("/tables/" + tableId + "/" + tablePlayer).set(id).then(
        function () {
            waitForGameStart(tableId);
        }
    );
    saveTableInfoToLocal(tableId, tablePlayer);
}

function getAvailableTable(getSeat) {
    $("#exampleModal").modal();
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
    return firebase.database().ref("/tables").push({"score1":0, "score2":0}).then(
        function (ref) {
            return ref.key;
        }
    );
}

function waitForGameStart(tableId) {
    firebase.database().ref("tables/" + tableId).on("value", decideGameStart)
}

function decideGameStart(snap) {
    let table = snap.val();
    console.log(table);
    if (table.hasOwnProperty("player1") && table.hasOwnProperty("player2")) {
        console.log("im in if");
        $("#exampleModal").modal("hide");
        //start the game
        firebase.database().ref("tables/" + snap.key).off("value", decideGameStart);
    }
}

function saveTableInfoToLocal(tableId, player) {
    localStorage.removeItem("tableData");
    localStorage.setItem("tableData", JSON.stringify({"tableId":tableId, "player":player}));
}

getAvailableTable(getSeat);