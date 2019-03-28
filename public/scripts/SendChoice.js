
function addWeapon(weapon="trash") {
    console.log(timerId);
    clearInterval(timerId);
    document.getElementById("countdown").style.display="none";
    document.getElementById("weapons").style.display="none";

    let player = JSON.parse(localStorage.getItem('userData'));
    player["weapon"]=weapon;
    console.log(player);
    localStorage.setItem('userData', JSON.stringify(player));
    saveWeaponToDatabase(weapon);
}

function saveWeaponToDatabase(weapon) {
    let tableData = JSON.parse(localStorage.getItem("tableData"));
    let sign;
    if (tableData.player === "player1") {
        sign = "sign1";
    }  else {
        sign = "sign2";
    }
    firebase.database().ref("tables/" + tableData.tableId + "/" + sign).set(weapon);
}