
function setGameFinishListener() {
    let tableData = JSON.parse(localStorage.getItem("tableData"));
    firebase.database().ref("tables/" + tableData.tableId).on("value", handleGameEnd);
}

function handleGameEnd(snap) {
    let table = snap.val();
    let playerType = JSON.parse(localStorage.getItem("tableData")).player;
    if (table.score1 === 3 || table.score2 === 3){
        clearInterval(timerId);
        clearTimeout(clearTimeoutId);
        firebase.database().ref("tables/" + snap.key).off("value", handleGameEnd);
        let isWinner = true;
        if (table.score1 === 3) {
            if (playerType === "player2") {
                isWinner = false;
            }
        } else if (table.score2 === 3) {
            if (playerType === "player1") {
                isWinner = false;
            }
        }

        if (isWinner) {
            showWinMessage();
        } else {
            showLoseMessage();
        }
    }

}

function showWinMessage() {
    let title = "You win!";
    let message = "Congratulations! You won the game!";
    showEndGameMessage(title, message);
}

function showLoseMessage() {
    let title = "You lose!";
    let message = "Oh no... You lost the game :(";
    showEndGameMessage(title, message);
}

function showEndGameMessage(title, message) {
    $("#continue-playing").on("click", prepareNewGame);
    $("#stop-playing").on("click", returnToLoginPage);
    $("#endGameModalLabel").html(title);
    $("#endGameModalBody").html(`<h6>${message}</h6>`);
    $("#endGameModal").modal();
}

function prepareNewGame() {
    removeTableData().then(function () {
        window.location.href = window.location.href;
    });
}

function returnToLoginPage() {
    removeTableData()
        .then(removePlayerData())
        .then(function () {
            window.location = "index.html";
        });
}

function removeTableData() {
    let tableId = JSON.parse(localStorage.getItem("tableData")).tableId;
    let removePromise = firebase.database().ref("tables/" + tableId).remove();
    return removePromise.then(function () {
            console.log("game end");
            localStorage.removeItem("tableData");
        }
    )
}

function removePlayerData() {
    let playerName = JSON.parse(localStorage.getItem("userData")).name;
    let removePromise = firebase.database().ref("players/" + playerName).remove();
    return removePromise.then(function () {
        localStorage.removeItem("userData");
        console.log("player deleted");
    })
}

function stopCheckingForBattle() {

}