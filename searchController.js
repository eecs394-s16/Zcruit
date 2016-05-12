angular.module('zcruit.search', ['ngAnimate', 'ui.bootstrap']);
angular.module('zcruit.search').controller('searchController', ['$scope','$location',function($scope,$location) {
  $scope.test = "hi";
  
  $scope.zscoreExplanation = "Here goes the zscore explanation.";
  
  // This defines what we want to say for the zscore explanation popul
  // we will probably want to make this dynamic at some point,
  // and also put it in a place where it's accessible to all pages if necessary
  // (currently just accessible in search profile)
  // eventually we will link zscores to players, making it more dynamic, 
  // and fill in as necessary instead of just hardcoding. for now we just have
  // one player and one zscore.
  $scope.zscore=92;
  
  if ($scope.zscore >= 85){
    $scope.zscoreExplanation = "This player is strongly likely to commit.";
  }
  
  else if ($scope.zscore >= 55){
    $scope.zscoreExplanation = "This player is moderately likely to commit.";
  }
  
  else{
     $scope.zscoreExplanation = "This player is unlikely to commit.";
  }
  
  $scope.openBigBoard = function(){
    window.open('big_board.html','_self');
  }
}]);
