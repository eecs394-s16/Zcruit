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

  // Add player to a list
  $scope.savePlayer = function(player, list) {
    if (list.Player_ids.find(function(e) { return e === player.Player_id; })) {
      // If the list already contains the player, show some kind of message?
    } else {
      list.Player_ids.push(player.Player_id);
      runQuery('UPDATE SavedLists SET Player_ids = "' + list.Player_ids.join() + '" WHERE List_id = ' + list.List_id);
      // Give user some kind of feedback
    }
  };

  var coach = 1;

  $scope.newList = function(name) {
    $scope.newListPopoverIsOpen = false;
    runQuery('INSERT INTO SavedLists (Coach_id, List_name) VALUES (' + coach + ',"' + name + '")',
      function() {
        getSavedLists();
        // Give user some kind of feedback
    });
  };

  // Run an arbitrary query, callback is passed the response if the query succeeds
  function runQuery(queryString, callback) {
    $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query=' + encodeURIComponent(queryString))
    .then(function(response) {
      if (response.status === 200 && callback) {
        callback(response.data);
      } else {
        console.log("Query error: " + response);
      }
    });
  }

  // Update the search results with a query string
  function runSearch(queryString) {
    runQuery(queryString, function(response) {
      $scope.players = response;
      $scope.setSelectedPlayer($scope.players[0]);
    });
  }

  // Retrieve the saved lists for this coach from the server
  function getSavedLists() {
    runQuery('SELECT * FROM SavedLists WHERE Coach_id = ' + coach, function(response) {
      for (var i = 0, l = response.length; i < l; i++) {
        // Save a representation of the player lists on client
        var playerList = [];
        if (response[i].Player_ids) {
          playerList = response[i].Player_ids.split(',');
        }
        response[i].Player_ids = playerList;
      }
      $scope.savedLists = response;
    });
  }
  
  runSearch('SELECT * FROM Players p, HighSchools h, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.AreaCoach_id = c.Coach_id');

  getSavedLists();

  $scope.newListPopover = {
    templateUrl: 'new_list_popover.html',
    title: "New List"
  };

  $scope.zscorePopover = {
    templateUrl: 'zscore_popover.html',
    title: "Zcruit Score"
  }

  $scope.openBigBoard = function() {
    window.open('big_board.html', '_self');
  }
}]);

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