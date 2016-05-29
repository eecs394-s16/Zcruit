angular.module('zcruit').controller('bigBoardController', ['$scope','$location','$http',function($scope,$location,$http) {

  $scope.openSearchProfile = function(){
    window.open('search_profile.html','_self');
  }

  $scope.zscoreColor = function(score) {
    if (score >= 8.0) {
      return "bright-green";
    } else if (score >= 6.5) {
      return "green";
    } else if (score > 5.0) {
      return "light-green";
    } else if (score === 5.0) {
      return "yellow";
    } else if (score >= 3.5) {
      return "light-red";
    } else if (score >= 2.0) {
      return "red";
    }
    return "bright-red";
  };
  
  // Begin List JS
  $scope.showLists = false;
  $scope.openMyLists = function(){
    $scope.showLists = !$scope.showLists;
  }

  $scope.openList = function(listID){
    window.open('search_profile.html','_self');
  }

  $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query='+ encodeURIComponent('SELECT DISTINCT List_name FROM SavedLists'))
  .then(function(response){
    $scope.myLists = eval(response.data);
    console.log($scope.myLists);
  });

  // End List JS
  
  $scope.height = function(heightInfo, type) {

    if (type == 1) {
      // get foot
      return Math.floor(heightInfo / 12)
    } else {
      // get inches
      return (heightInfo % 12)
    }
  };

  $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query='+ encodeURIComponent('SELECT DISTINCT Position_name FROM Positions'))
  .then(function(response){
  	$scope.positions = eval(response.data);
  	console.log($scope.positions);
  });

  $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query=' + encodeURIComponent('SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id'))
  .then(function(response) {
    $scope.players = eval(response.data);
  });
}]);