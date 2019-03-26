let readData = firebase.database().ref('tables/');

readData.on('value', function (snap) {
    for (let key in snap.val()){
        console.log(key);
    }
}, function (error) {
    console.log("error " + error.code);
})




