angular.module('zcruit.search').controller('bigBoardController', ['$scope','$location',function($scope,$location) {

  $scope.openSearchProfile = function(){
    window.open('search_profile.html','_self');
  }
}]);