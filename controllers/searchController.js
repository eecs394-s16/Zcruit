angular.module('zcruit').controller('searchController', ['$scope', '$location', '$http', function($scope, $location, $http) {
  $scope.initials = function(name) {
    name = name.split(' ');
    return name[0][0] + name[1][0];
  };
  
  $scope.phoneFormat = function(phone) {
    if (phone) {
      return phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6, 10);
    }
  };
  
  $scope.boolToText = function(bool) {
    return bool === '0' ? 'No' : 'Yes';
  };
  
  $scope.setSelectedPlayer = function(player) {
    $scope.selected = player;
    console.log(player);
    
    if (player.Zscore >= 8.5) {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is strongly likely to commit.";
    } else if (player.Zscore >= 5.5) {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is moderately likely to commit.";
    } else {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is unlikely to commit.";
    }
  };

  runQuery('SELECT * FROM Players p, HighSchools h, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.AreaCoach_id = c.Coach_id');

  $scope.zscorePopover = {
    templateUrl: 'zscore_popover.html',
    title: "Zcruit Score"
  };

  $scope.openBigBoard = function() {
    window.open('big_board.html', '_self');
  };
}]);

function buildSearchQuery($scope) {
  var query = 'SELECT DISTINCT * FROM Players p, HighSchools h, Coaches c, Positions pos WHERE p.HighSchool_id = h.HS_id AND p.AreaCoach_id = c.Coach_id AND p.Player_id = pos.Player_id';

  query +=         ' AND p.GPA BETWEEN ' + $scope.minGPA + ' AND ' + $scope.maxGPA;
  query += ' AND p.Height BETWEEN ' + $scope.minHeight + ' AND ' + $scope.maxHeight;
  query += ' AND p.Weight BETWEEN ' + $scope.minWeight + ' AND ' + $scope.maxWeight;

  if ($scope.year) {
    query += ' AND p.Year = ' + $scope.year;
  }
  if ($scope.state) {
    query += ' AND p.State = ' + $scope.state;
  }
  if ($scope.state) {
    query += ' AND p.State = ' + $scope.state;
  }
  if ($scope.firstName) {
    query += ' AND p.FirstName = ' + $scope.firstName + '%';
  }
  if ($scope.lastName) {
    query += ' AND p.LastName = ' + $scope.lastName + '%';
  }
  if ($scope.highSchool) {
    query += ' AND h.HS_name = ' + '%' + $scope.highSchool + '%';
  }
  if ($scope.positions) {
    query += 'AND pos.Position_name in ("' + $scope.positions[0].label + '"';
    for (var i = 1, l = $scope.positions.length; i < l; i++) {
      query += ',"' + $scope.positions[i].label + '"';
    }
    query += ')';
  }
  if ($scope.coach) {
    query += ' AND c.Coach_name = ' + '%' + $scope.coach + '%';
  }

  return query;
}

function runQuery(queryString) {
  $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query=' + encodeURIComponent(queryString))
  .then(function(response) {
    $scope.players = eval(response.data);
    $scope.setSelectedPlayer($scope.players[0]);
  });
}

// MODAL CONTROLLERS
angular.module('zcruit').controller('ModalDemoCtrl', function ($scope, $uibModal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('zcruit').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});