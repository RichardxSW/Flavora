document.addEventListener("DOMContentLoaded", function() {
    const btnSave = document.querySelector(".unsaved");
    const btnUnsave = document.querySelector(".saved");

    btnSave.addEventListener("click", function () {
        btnSave.style.display = "none";
        btnUnsave.style.display = "inline-block"
    })

    btnUnsave.addEventListener("click", function () {
        btnUnsave.style.display = "none";
        btnSave.style.display = "inline-block";
    })

    
});

// Menginisialisasi AngularJS app
var app = angular.module('myApp', []);

// Mendefinisikan controller untuk navbar
app.controller('myCtrl', function($scope) {
    // Mendapatkan nilai username dari localStorage
    var username = localStorage.getItem('username');
    // Menetapkan nilai username ke dalam scope
    $scope.username = username;
});