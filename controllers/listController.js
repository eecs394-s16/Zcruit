angular.module('zcruit').controller('listController', ['$scope', '$location', '$http', function($scope, $location, $http) {

  $scope.openMyLists = function(){
    $scope.showLists = !$scope.showLists;
  }

  };

}]);