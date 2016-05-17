angular.module('zcruit').controller('bigBoardController', ['$scope','$location',function($scope,$location) {

  $scope.showLists = false;

  $scope.openSearchProfile = function(){
    window.open('search_profile.html','_self');
  }

  $scope.openList = function(listID){
    window.open('search_profile.html','_self');
  }

   $scope.openMyLists = function(){
   	$scope.showLists = !$scope.showLists;
  }
}]);