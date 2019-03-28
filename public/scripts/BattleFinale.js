
function clearChoices() {
    let tableId = JSON.parse(localStorage.getItem("tableData")).tableId;
    return firebase.database().ref("tables/" + tableId + "/sign1").remove().then(function () {
        return firebase.database().ref("tables/" + tableId + "/sign2").remove();
    });

}