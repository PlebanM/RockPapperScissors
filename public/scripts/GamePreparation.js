
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
    setGameFinishListener();
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


//              RESOLVE BATTLE


let table = {"player1":"Name",
                "player2":"Name2",
                "score1" : 1,
                "score2" : 2,
                "sign1":"paper",
                "sign2":"rock"
};

function takeDataFromLocalStorage(key = "tableData"){
    let dataFromLS = JSON.parse(localStorage.getItem(key));
    return dataFromLS;
}
function findPlayerInDB() {

    let tableName = "-LatciE9_4znrhcvYR3G";
    // let tableName = JSON.parse(localStorage.getItem('userData')).tableId;
    let readData = firebase.database().ref('tables/');

    let table;
    return firebase.database().ref('/tables/' + tableName).once('value').then(function(snapshot) {
        table = snapshot.val();
        console.log(table);
        return table;
    });
}


function assignOpponentToObject(){
    let opponent = {};
    // let dataFromLS = takeDataFromLocalStorage();
    let table = findPlayerInDB();
    return table.then(function (table) {
        let dataFromLS = {player:'player1', weapon:""};
        console.log("assing opponent " + table);

        if(dataFromLS['player'] === 'player1'){
            opponent['name'] = table['player2'];
            opponent['weapon'] = table['sign2'];
        }else{
            opponent['name'] = table['player1'];
            opponent['weapon'] = table['sign1'];
        }
        return opponent;
    })
}


function assignGamePlayerToObject() {
    let playerFromDB = findPlayerInDB();
    return playerFromDB.then(function (playerFromDB) {
        let objectGamePlayer = {};
        // let dataFromLS = takeDataFromLocalStorage();
        let dataFromLS = {player:'player1'};
        console.log("assing opponent " + playerFromDB);

        if(dataFromLS['player'] === 'player1'){
            objectGamePlayer['name'] = playerFromDB['player1'];
            objectGamePlayer['weapon'] = playerFromDB['sign1'];
        }else{
            objectGamePlayer['name'] = playerFromDB['player2'];
            objectGamePlayer['weapon'] = playerFromDB['sign2'];
        }
        return objectGamePlayer;
    });
}


function battle() {
    let gamePlayer = assignGamePlayerToObject();
    gamePlayer.then(function (gamePlayer) {
        let opponent = assignOpponentToObject();
        opponent.then(function (opponent) {
            console.log("opp: ");
            console.log(opponent);
            battleDecision(gamePlayer,opponent);
        });
    })
}
function battleDecision(gamePlayer, opponent){
    console.log(gamePlayer);
    console.log(opponent);
    if(gamePlayer['weapon']==='scissors' && opponent['weapon']==='rock'){
        console.log(opponent['name'] + " win!");
        sendScoreToDB(opponent['name'], 1);
    }else if(gamePlayer['weapon']==='scissors' && opponent['weapon']==='paper'){
        console.log("You WIN!");
        sendScoreToDB(gamePlayer["name"], 1);
    }else if(gamePlayer['weapon']==='paper' && opponent['weapon']==='scissors'){
        console.log(opponent['name'] + " win!");
        sendScoreToDB(opponent['name'], 1);
    }else if(gamePlayer['weapon']==='paper' && opponent['weapon']==='rock'){
        console.log("You WIN!");
        sendScoreToDB(gamePlayer["name"], 1);
    }else if(gamePlayer['weapon']==='rock' && opponent['weapon']==='paper'){
        console.log(opponent['name'] + " win!");
        sendScoreToDB(opponent['name'], 1);
    }else if(gamePlayer['weapon']==='rock' && opponent['weapon']==='scissors'){
        console.log("You WIN!");
        sendScoreToDB(gamePlayer["name"], 1);
    }else if(gamePlayer['weapon']===opponent['weapon']){
        console.log("REMIS");

    }else if(gamePlayer['weapon']==='trash'){
        console.log(opponent['name'] + " win!");
        sendScoreToDB(opponent['name'], 1);
    }else if(opponent['weapon']==='scissors'){
        console.log("You WIN!");
        sendScoreToDB(gamePlayer["name"], 1);
    }

}



function sendScoreToDB(playerName='Mareusz', scores=1) {
    let update = {};
    checkPlayerScore().then(function (prom) {
        console.log(prom);
        update['players/' + playerName] = {'score': prom+scores};
        firebase.database().ref().update(update);
    });
}

function checkPlayerScore(playerName="Mareusz") {
    return firebase.database().ref("players/" + playerName).once("value").then(function (snap) {
        return (snap.val())
    }).then(function (obj) {
        return obj["score"];
    });

}

//              END RESOLVE BATTLE
//player(player1 lub player2); tableId(jhsdakjsd)