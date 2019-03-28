let timerId;
let clearTimeoutId;
document.getElementById("showWelcomeText").addEventListener('load', showUserName);
function getSeat(tableId, isSecondPlayer) {
    let id = JSON.parse(localStorage.getItem("userData"))["name"];
    firebase.database().ref("players/" + id + "/table").set(tableId);
    let tablePlayer;
    if (isSecondPlayer) {
        tablePlayer = "player2";
    } else {
        tablePlayer = "player1";
    }
    const promise = firebase.database().ref("/tables/" + tableId + "/" + tablePlayer).set(id).then(
        function () {
            waitForGameStart(tableId);
        }
    );
    promise
        .then(saveTableInfoToLocal(tableId, tablePlayer))
        .then(setGameFinishListener());

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
    firebase.database().ref("tables/" + tableId).on("value", decideGameStart);
    waitForTwoWeaponInDB(tableId);

}
function decideGameStart(snap) {
    let table = snap.val();
    console.log(table);
    if (table.hasOwnProperty("player1") && table.hasOwnProperty("player2")) {
        console.log("im in if");
        $("#exampleModal").modal("hide");
        startCountdown();
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


// let table = {"player1":"Name",
//                 "player2":"Name2",
//                 "score1" : 1,
//                 "score2" : 2,
//                 "sign1":"paper",
//                 "sign2":"rock"
// };

function takeDataFromLocalStorage(key = "tableData"){
    let dataFromLS = JSON.parse(localStorage.getItem(key));
    return dataFromLS;
}
function takeTableFromDB() {

    let tableName = takeDataFromLocalStorage();
    console.log(tableName.tableId + "<---tableID " + tableName + "<----table");
    let table;
    return firebase.database().ref('/tables/' + tableName.tableId).once('value').then(function(snapshot) {
        table = snapshot.val();
        console.log(table + "<<<<<<table name");
        return table;
    });
}


function assignOpponentToObject(){
    let playerFromDB = takeTableFromDB();
    return playerFromDB.then(function (playerFromDB) {
        let opponent = {};
        let dataFromLS = takeDataFromLocalStorage();
        // let dataFromLS = {player:'player1'};
        console.log("assing player " + playerFromDB);
        let keys = Object.keys(playerFromDB);

        if(dataFromLS['player'] === 'player1'){
            opponent['name'] = playerFromDB['player2'];
            opponent['weapon'] = playerFromDB['sign2'];
            opponent['scoreKey'] = keys[3];
        }else{
            opponent['name'] = playerFromDB['player1'];
            opponent['weapon'] = playerFromDB['sign1'];
            opponent['scoreKey'] = keys[2];

        }
        return opponent;
    })
}


function assignGamePlayerToObject() {
    let playerFromDB = takeTableFromDB();
    return playerFromDB.then(function (playerFromDB) {
        let objectGamePlayer = {};
        let dataFromLS = takeDataFromLocalStorage();
        // let dataFromLS = {player:'player1'};
        console.log("assing player " + playerFromDB.player);
        let keys = Object.keys(playerFromDB);

        if(dataFromLS['player'] === 'player1'){
            objectGamePlayer['name'] = playerFromDB['player1'];
            objectGamePlayer['weapon'] = playerFromDB['sign1'];
            objectGamePlayer['scoreKey'] = keys[2];

        }else{
            objectGamePlayer['name'] = playerFromDB['player2'];
            objectGamePlayer['weapon'] = playerFromDB['sign2'];
            objectGamePlayer['scoreKey'] = keys[3];

        }
        return objectGamePlayer;
    });
}


function battle() {
    let gamePlayer = assignGamePlayerToObject();
    gamePlayer.then(function (gamePlayer) {
        let opponent = assignOpponentToObject();
        opponent.then(function (opponent) {
            console.log(opponent);
            console.log(gamePlayer);

            returnToChooseState(battleDecision(gamePlayer,opponent));
            // decideGameStart();
        });
    })
}
function battleDecision(gamePlayer, opponent){
    console.log("opp2: " + opponent.weapon);
    console.log("YOU2: " + gamePlayer.weapon);
    let gameObject;
    if(gamePlayer['weapon']==='scissors' && opponent['weapon']==='rock'){
        console.log(opponent['name'] + " win!");
        sendScoreToDB(opponent['name'], opponent['scoreKey']);
        gameObject = new GameResult(opponent.name, opponent.weapon, gamePlayer.name, gamePlayer.weapon);
    }else if(gamePlayer['weapon']==='scissors' && opponent['weapon']==='paper'){
        console.log("You WIN!");
        gameObject = new GameResult(gamePlayer.name, gamePlayer.weapon, opponent.name, opponent.weapon);
        sendScoreToDB(gamePlayer["name"], gamePlayer['scoreKey']);
    }else if(gamePlayer['weapon']==='paper' && opponent['weapon']==='scissors'){
        console.log(opponent['name'] + " win!");
        gameObject = new GameResult(opponent.name, opponent.weapon, gamePlayer.name, gamePlayer.weapon);
        sendScoreToDB(opponent['name'], opponent['scoreKey']);
    }else if(gamePlayer['weapon']==='paper' && opponent['weapon']==='rock'){
        console.log("You WIN!");
        gameObject = new GameResult(gamePlayer.name, gamePlayer.weapon, opponent.name, opponent.weapon);
        sendScoreToDB(gamePlayer["name"], gamePlayer['scoreKey']);
    }else if(gamePlayer['weapon']==='rock' && opponent['weapon']==='paper'){
        console.log(opponent['name'] + " win!");
        gameObject = new GameResult(opponent.name, opponent.weapon, gamePlayer.name, gamePlayer.weapon);
        sendScoreToDB(opponent['name'], opponent['scoreKey']);
    }else if(gamePlayer['weapon']==='rock' && opponent['weapon']==='scissors') {
        console.log("You WIN!");
        sendScoreToDB(gamePlayer["name"], gamePlayer['scoreKey']);
        gameObject = new GameResult(gamePlayer.name, gamePlayer.weapon, opponent.name, opponent.weapon);
    }else if(gamePlayer['weapon']===opponent['weapon'] && gamePlayer['weapon']!=='trash'){
        gameObject = new GameResult(gamePlayer.name, gamePlayer.weapon, opponent.name, opponent.weapon);
    }else if(gamePlayer['weapon']===opponent['weapon'] && gamePlayer['weapon']==='trash'){
        sendScoreToDB(opponent['name'], opponent['scoreKey']);
        sendScoreToDB(gamePlayer["name"], gamePlayer['scoreKey']);
        gameObject = new GameResult(opponent.name, opponent.weapon, gamePlayer.name, gamePlayer.weapon);
    }else if(gamePlayer['weapon']==='trash'){
        sendScoreToDB(opponent['name'], opponent['scoreKey']);
        gameObject = new GameResult(opponent.name, opponent.weapon, gamePlayer.name, gamePlayer.weapon);
    }else if(opponent['weapon']==='trash'){
        sendScoreToDB(gamePlayer["name"], gamePlayer['scoreKey']);
        gameObject = new GameResult(gamePlayer.name, gamePlayer.weapon, opponent.name, opponent.weapon);
    }
    return gameObject;
}


class GameResult{
    constructor (winnerName,  winnerWeapon, looserName, looserWeapon){
        this.winnerName = winnerName;
        this.looserName = looserName;
        this.winnerWeapon = winnerWeapon;
        this.looserWeapon = looserWeapon;
    }
}

function sendScoreToDB(playerName, scoreKey) {
    let tableName = JSON.parse(localStorage.getItem('tableData')).tableId;
    checkPlayerScore(playerName, tableName, scoreKey).then(function (prom) {
        console.log(prom + "<<<<<score");
        let newScore = prom+1;
        let dirToScoreKey = "tables/"+tableName+"/"+scoreKey;
        firebase.database().ref(dirToScoreKey).set(newScore);

    });
}

function checkPlayerScore(playerName, tableName, scoreKey) {
    return firebase.database().ref("tables/" + tableName).once("value").then(function (snap) {
        return (snap.val())
    }).then(function (obj) {
        return obj[scoreKey];
    });

}
//player(player1 lub player2); tableId(jhsdakjsd)

//              END RESOLVE BATTLE

//              Choose Weapon

function startCountdown() {
    document.getElementById("VS").style.display="none";

    let player = JSON.parse(localStorage.getItem('userData'));
    player["weapon"] = "trash";
    localStorage.setItem('userData', JSON.stringify(player));

    let weapons = document.getElementById("weapons");
    weapons.style.display = "flex";
    let timeLeft = 10;
    timerId = setInterval(function () {
        let countdown = document.getElementById("countdown");
        countdown.innerHTML = timeLeft + " seconds remaining";
        countdown.style.display = "block";
        timeLeft -= 1;
        if(timeLeft <= 0) {
            clearInterval(timerId);
            document.getElementById("countdown").innerHTML = "";
            weapons.style.display = "none";

            if (JSON.parse(localStorage.getItem('userData')).weapon === "trash") {
                addWeapon();
            }

            //here we initialize game, and show who win and what weapon choose opponent(and his name).
            //Next we start another game or end game(with score). Ask if player want play again.
            //change to make this for smartphone  l: 53 GamePrep
        }
    }, 1000);
}

function waitForTwoWeaponInDB(tableId) {
    firebase.database().ref("tables/" + tableId).on("value", decideBattleStart);

}

function decideBattleStart(snap) {
    let table = snap.val();
    if (table.hasOwnProperty("sign1") && table.hasOwnProperty("sign2")){
        firebase.database().ref("tables/" + snap.key).off("value", decideBattleStart);
        battle();
    }
}

function returnToChooseState(gameObject) {
    let tableId = JSON.parse(localStorage.getItem("tableData")).tableId;
    //here goes setting up battle result function
    showWinningPage(gameObject);
    clearTimeoutId = setTimeout(function () {
        //here goes clearing battle result function
       clearWinningPage();

        if (!($("#endGameModal").data('bs.modal') || {})._isShown) {
            clearChoices()
                .then(startCountdown())
                .then(waitForTwoWeaponInDB(tableId));
        }
    }, 3000);

}

//                  Who Win Battle

function createLinkToPicture(weaponName){
    return "assets/pictures/"+ weaponName + ".png";

}

function showWinningPage(gameObject){

    console.log(createLinkToPicture(gameObject.looserWeapon) + "<----winnerWeapon");

    let playerName = JSON.parse(localStorage.getItem('userData')).name;
    if (gameObject.winnerWeapon === gameObject.looserWeapon && gameObject.winnerWeapon!=='trash'){
        document.getElementById("playerName").innerHTML = `<div>DRAW!</div><img class = 'resposiveImg'  src=${createLinkToPicture(gameObject.winnerWeapon)} />`;
        document.getElementById("opponentName").innerHTML = `<div>DRAW! </div><img class = 'resposiveImg' src=${createLinkToPicture(gameObject.looserWeapon)} />`;

    }else if (gameObject.winnerWeapon === gameObject.looserWeapon && gameObject.winnerWeapon==='trash'){
        document.getElementById("playerName").innerHTML = `<div>DRAW! TRASH</div><img class = 'resposiveImg'  src=${createLinkToPicture(gameObject.winnerWeapon)} />`;
        document.getElementById("opponentName").innerHTML = `<div>DRAW! TRASH</div><img class = 'resposiveImg' src=${createLinkToPicture(gameObject.looserWeapon)} />`;
    }else if (playerName == gameObject.winnerName) {
        document.getElementById("playerName").innerHTML = `<div>YOU WIN!</div><img class = 'resposiveImg'  src=${createLinkToPicture(gameObject.winnerWeapon)} />`;
        document.getElementById("opponentName").innerHTML = `<div>${gameObject.looserName} LOOSE! </div><img class = 'resposiveImg' src=${createLinkToPicture(gameObject.looserWeapon)} />`;
        document.getElementById("VS").style.display="flex";
    } else{
        document.getElementById("playerName").innerHTML = `<div>YOU LOOSE!</div> <img class = 'resposiveImg' src=${createLinkToPicture(gameObject.looserWeapon)} />`;
        document.getElementById("opponentName").innerHTML = `<div>${gameObject.winnerName} WIN!</div><img class = 'resposiveImg' src=${createLinkToPicture(gameObject.winnerWeapon)} />`;
        document.getElementById("VS").style.display="flex"  ;

    }

    // clearGameResult();
    ///TODO: dla remisu jeszcze dorobic

}

function clearWinningPage(){
    document.getElementById("playerName").innerHTML = "";
    document.getElementById("opponentName").innerHTML = "";
    document.getElementById("VS").style.display="none";
    // let element = document.getElementById("opponentWeaponImage");
    // element.parentNode.removeChild(element);
    // let element2 = document.getElementById("playerWeaponImage");
    // element2.parentNode.removeChild(element2);
    // document.getElementById("winnerInfo").innerText = "";
    // document.getElementById("looserInfo").innerText = "";

}

