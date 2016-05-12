angular.module('zcruit.search', ['ngAnimate', 'ui.bootstrap']);
angular.module('zcruit.search').controller('searchController', ['$scope','$location','$sce',function($scope, $location, $sce) {
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
  
  $scope.zscorePopoverHtml = $sce.trustAsHtml('<div id="popoverWrapper"><div>This player is strongly likely to commit</div><br><div class="playerCard" ng-repeat="i in [1,2]"><div class="status offered"></div><div class="avatar" style="background-image: url("' + "https://blog-blogmediainc.netdna-ssl.com/upload/SportsBlogcom/2159727/0413747001456770288_filepicker.png" + '");"></div><div class="player"><div class="playerInfo"><div class="playerInfoName">Michael Jordan</div><div class="playerInfoStats">QB - 611" 280lbs</div><div class="playerInfoCoach">IL - Fitzgerald</div></div><div class="zscore"><div class="playerZscore">92</div></div></div></div></div>');
}]);
