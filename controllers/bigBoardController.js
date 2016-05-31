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

  // Run an arbitrary query, callback is passed the response if the query succeeds
  function runQuery(queryString, callback) {
    $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query=' + encodeURIComponent(queryString))
    .then(function(response) {
      if (response.status === 200) {
        if (callback) {
          callback(response.data);
        }
      } else {
        console.log("Query error: " + response);
      }
    });
  }
  
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
    $scope.myLists = response.data;
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

  $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query=' + encodeURIComponent('SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id ORDER BY Position_name, Position_rank'))
  .then(function(response) {
    // Put the players into their positions
    // Players are already ordered by position rank, so no sorting needed
    var players = response.data;
    var positions = {};
    for (var i = 0, l = players.length; i < l; i++) {
      var p = players[i];
      var pos = p.Position_name;
      if (pos in positions) {
        positions[pos].push(p);
      } else {
        positions[pos] = [p];
      }
    }

    $scope.positions = positions;
  });

  $scope.reorder = function(event, pos, newIndex, oldIndex) {
    $scope.positions[pos].splice(newIndex, 0, $scope.positions[pos].splice(oldIndex, 1)[0]);

    // Update the position ranks in the database
    var query = "UPDATE Positions SET Position_rank = CASE Pos_id";
    var lo = Math.min(newIndex, oldIndex);
    var hi = Math.max(newIndex, oldIndex);
    var ids = [];
    for (var i = lo; i <= hi; i++) {
      var p = $scope.positions[pos][i];
      ids.push(p.Pos_id);
      query += " WHEN " + p.Pos_id + " THEN " + (i + 1);
    }
    query += " END WHERE Pos_id IN (" + ids.join(',') + ")";
    runQuery(query);
  };

  $scope.noSwipe = function(event) {
    event.preventDefault();
  };
}]);