//
// if (checkIfGameIsEnded()){
//      console.log("game over");}
// else{
//      console.log("game not over");
// }

addScoreEventHandlers();



function checkIfGameIsEnded() {

    return firebase.database().ref("players/" + myName).once("value")
        .then(function (snap) {
            return (snap.val()["table"])
        }).then(function (tableId) {
            firebase.database().ref("tables/" + tableId).once("value").
                 then(function (table) {
                     if (
                     table.val()["score1"] === 3 || table.val()["score2"] === 3){
                         return true;
                     } else {
                         return false;
                     }
             })
        })
}

function handleWinPlayer1() {
    console.log("player1 win!!")
}

function handleWinPlayer2() {
    console.log("player2 win!!")
}

function addScoreEventHandlers(tableId) {

    console.log("events added");

    firebase.database().ref("tables/" + tableId + "/score1").on("value", function (snap) {
            if (snap.val() === 3) handleWinPlayer1();
    })

    firebase.database().ref("tables/" + tableId + "/score2").on("value", function (snap) {
            if (snap.val() === 3) handleWinPlayer2();
    })

}