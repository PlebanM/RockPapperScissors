window.onload = showUserName;

let readData = firebase.database().ref('players/');
var users = [];
readData.on('value', function (snap) {
    for (let key in snap.val()){
        users.push(key);
    }
}, function (error) {
    console.log("error " + error.code);
});


function addActualPlayer(login) {
    let update = {};
    update['players/'+ login] = {'score': 0};
    return firebase.database().ref().update(update);
}


function checkIfPlayerExist(login){


    let isInDB = users.includes(login);
    console.log(users);

    if (isInDB || login.length==0){
        document.getElementById("login").classList.add("form-control","is-invalid");

    }else {
        document.getElementById("login").classList.remove("form-control","is-invalid");
        createPlayer(login);
        addActualPlayer(login);
        window.location.href = "play.html";
        document.getElementById("redirectFromLogin").setAttribute('action', 'play.html');

    }

    }

function createPlayer(userName) {
    localStorage.clear();
    let player = {
        name: userName,
        weapon: undefined
    };
    localStorage.setItem('userData', JSON.stringify(player));

}

function showUserName() {
    let storageData = JSON.parse(localStorage.getItem('userData'));
    document.getElementById('showWelcomeText').innerText += " " + storageData['name'];
}