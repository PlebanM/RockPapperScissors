function createPlayer() {
    localStorage.clear();
    // let name = document.getElementById('login').value;
    let player = {
        name: document.getElementById('login').value,
        weapon: undefined
    };
    console.log(player.name);
    localStorage.setItem('userData', JSON.stringify(player));
}

function showUserName() {
    let storageData = JSON.parse(localStorage.getItem('userData'));
    console.log(storageData);
    document.getElementById('showName').innerHTML += storageData['name'];
}

function addWeapon(weapon) {
    let player = JSON.parse(localStorage.getItem('userData'));
    player["weapon"]=weapon;
    console.log(player.weapon);
    localStorage.setItem('userData', JSON.stringify(player));

}