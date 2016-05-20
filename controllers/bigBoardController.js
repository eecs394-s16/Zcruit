angular.module('zcruit').controller('bigBoardController', ['$scope','$location','$http',function($scope,$location,$http) {

  $scope.openSearchProfile = function(){
    window.open('search_profile.html','_self');
  }

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