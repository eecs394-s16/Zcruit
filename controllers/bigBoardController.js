angular.module('zcruit').controller('bigBoardController', ['$scope','$location',function($scope,$location) {

  $scope.openSearchProfile = function(){
    window.open('search_profile.html','_self');
  }
}]);