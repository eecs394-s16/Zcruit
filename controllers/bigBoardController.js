var defaultSearch = 'SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id AND p.AreaCoach_id = c.Coach_id';


angular.module('zcruit').controller('bigBoardController', ['$scope','$location','$http','$timeout',function($scope,$location,$http,$timeout) {

  var coach = 1;
  $scope._ = _;
  var board = angular.element(document.getElementById("board"));

  $scope.openSearchProfile = function(){
    window.open('search_profile.html','_self');
  };

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

  $scope.openList = function(listID){
    window.open('search_profile.html','_self');
  };

  runQuery('SELECT DISTINCT List_name FROM SavedLists', function(response) {
    $scope.myLists = response;
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

  runQuery('SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id ORDER BY Position_name, Position_rank',
    function(players) {
    // Put the players into their positions
    // Players are already ordered by position rank, so no sorting needed
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

  $scope.initials = function(name) {
    if (name !== undefined) {
      name = name.split(' ');
      return name[0][0] + name[1][0];
    }
  };

  $scope.phoneFormat = function(phone) {
    if (phone) {
      phone = phone.toString();
      return phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6, 10);
    }
  };

  $scope.setSelectedPlayer = function(player, event) {
    // If we're clicking on a player we already clicked on, unselect them
    if ($scope.selected && $scope.selected.Player_id === player.Player_id) {
      $scope.selected = null;
      $scope.showScrollBuffer = false;
      return;
    }

    // If no selected player yet or selected player is different position from previously selected
    if (!$scope.selected || $scope.selected.Position_name !== player.Position_name) {
      // Scroll the big board so the player card is visible
      var pos = document.getElementById(player.Position_name);

      // Find which # position this is
      var parent = pos.parentNode;
      var index = Array.prototype.indexOf.call(parent.children, pos);

      // If this position is one of the last three, do terrible things to make the scrolling work
      if (index >= _.size($scope.positions) - 2) {
        // Show the big white scroll buffer
        $scope.showScrollBuffer = true;
        // Defer the scroll top so the scroll buffer shows up in time
        $timeout(function() { board.scrollTo(pos.offsetLeft - 105, 0); });
      } else {
        board.scrollTo(pos.offsetLeft - 105, 0);
      }
    }

    $scope.selected = $scope.players[player.Player_id];

    if (player.Zscore >= 8.5) {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is strongly likely to commit.";
    } else if (player.Zscore >= 5.5) {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is moderately likely to commit.";
    } else {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is unlikely to commit.";
    }

    if ($scope.zscoreWillGrow(player)){
      $scope.twoZscores = true;
      var numVisit = String(2 - player.Visits);
      var pluralVisit = "";
      if (numVisit == 2){
        pluralVisit = "s";
      }
    }
    else{
      $scope.twoZscores = false;
    }

    if (player.Zscore2 >= 8.5) {
      $scope.zscoreExplanation2 = "A projected score of " + player.Zscore2 + " means this player is strongly likely to commit given " + numVisit + " additional visit" + pluralVisit + " to the university.";
    } else if (player.Zscore2 >= 5.5) {
      $scope.zscoreExplanation2 = "A projected score of " + player.Zscore2 + " means this player is moderately likely to commit given " + numVisit + " additional visit" + pluralVisit + " to the university.";
    } else {
      $scope.zscoreExplanation2 = "A projected score of " + player.Zscore2 + " means this player is unlikely to commit given " + numVisit + " additional visit" + pluralVisit + " to the university.";
    }
  };

  $scope.height = function(heightInfo, type) {

    if (type == 1) {
      // get foot
      return Math.floor(heightInfo / 12)
    } else {
      // get inches
      return (heightInfo % 12)
    }
  };

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

  $scope.zscoreWillGrow = function(player) {
    if (player && (player.Visits >= 2 || player.Attended_camp === "1" || player.Visits_overnight === "1")) {
      return false;
    }
    return true;
  };

  $scope.statusText = function(status) {
    switch(status) {
      case "0":
        return "Committed";
      case "1":
        return "Offer";
      case "2":
        return "Active recruit";
      case "3":
        return "Evaluation needed";
      case "4":
        return "FBS recruit";
      case "5":
        return "Walk on";
      case "6":
        if ($scope.selected.School_committed_to > 0) {
          return $scope.Colleges[$scope.selected.School_committed_to - 1].College_name + " commit";
        } else {
          return "Rejected";
        }
    }
  };

  $scope.statusColor = function(status) {
    switch(status) {
      case "0":
        return "status-purple";
      case "1":
        return "status-green";
      case "2":
        return "status-gold";
      case "3":
        return "status-blue";
      case "4":
        return "status-grey";
      case "5":
        return "status-lilac";
      case "6":
        return "status-red";
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

  $scope.newList = function(name) {
    $scope.newListPopoverIsOpen = false;
    runQuery('INSERT INTO SavedLists (Coach_id, List_name) VALUES (' + coach + ',"' + name + '")',
      function() {
        getSavedLists();
        // Give user some kind of feedback
    });
  };
  $scope.cancel = function() {
     $scope.newListPopoverIsOpen = false;
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

  $scope.reorder = function(event, pos, newIndex, oldIndex) {
    // If the card didn't move, don't bother doing anything
    if (newIndex === oldIndex) {
      return;
    }

    $scope.positions[pos].splice(newIndex, 0, $scope.positions[pos].splice(oldIndex, 1)[0]);

    // Update the position ranks in the database
    var query = "UPDATE Positions SET Position_rank = CASE Pos_id";
    var ids = [];
    for (var i = 0, l = $scope.positions[pos].length; i < l; i++) {
      var p = $scope.positions[pos][i];
      ids.push(p.Pos_id);
      query += " WHEN " + p.Pos_id + " THEN " + (i + 1);
    }
    query += " END WHERE Pos_id IN (" + ids.join(',') + ")";
    runQuery(query);
  };

  // Update the search results with a query string
  function runSearch(queryString) {
    runQuery(queryString + " ORDER BY p.NU_Status, p.Zscore DESC", function(response) {
      // console.table(response);

      // Build connections and position list for each player
      // console.table(response);
      var playerDict = {};
      for (var i = 0, l = response.length; i < l; i++) {
        var player = response[i];
        var id = player.Player_id;
        if (id in playerDict) {
          // append to end of position name any new ones
          playerDict[id].Position_name += ', ' + player.Position_name;
        } else {
          player.connections = [];
          if (player.Attended_camp === "1") {
            player.connections.push("Attend camp");
          }
          if (player.Legacy === "1") {
            player.connections.push("Legacy");
          }
          if (player.Sibling === "1") {
            player.connections.push("Sibling");
          }
          if (player.Other_strong_connections === "1") {
            player.connections.push("Other strong connection");
          }
          player.Feet = Math.floor(player.Height / 12);
          player.Inches = player.Height % 12;
          player.offers = [];
          playerDict[id] = player;
        }
      }

      var offerQueryString = "SELECT *  FROM Players p, Colleges c, College_status cs WHERE p.Player_id = cs.Player_id AND c.College_id = cs.College_id";
      // get offers for all players
      runQuery(offerQueryString, function(responseColleges) {
        for (var j = 0; j < responseColleges.length; j++) {
          var college = responseColleges[j];
          var id = college.Player_id;
          if (id in playerDict) {
            playerDict[id].offers.push({id: college.College_id, img_path: '../img/college_logos/'+encodeURIComponent(college.College_name)+'.gif'});
          }
        }

        $scope.players = playerDict;
      });
    });
  }

  runSearch(defaultSearch);

  // Retrieve the saved lists for this coach from the server
  function getSavedLists() {
    runQuery('SELECT * FROM SavedLists WHERE Coach_id = ' + coach, function(response) {
      for (var i = 0, l = response.length; i < l; i++) {
        // Save a representation of the player lists on client
        var playerList = [];
        if (response[i].Player_ids) {
          playerList = response[i].Player_ids.toString().split(',').map(function(e, i, a) { return parseInt(e, 10); });
          // console.log(playerList);
        }
        response[i].Player_ids = playerList;
      }
      $scope.savedLists = response;
      // Add the default option to the selections
      $scope.savedLists.unshift({List_name:"Search Results", List_id: 0});
      // Select the default option
      $scope.selectedList = $scope.savedLists[0];
    });
  }

  runQuery("SELECT * FROM Colleges ORDER BY College_id", function(response) {
    $scope.Colleges = response;
  });

  getSavedLists();

  $scope.updateData = function(tableName,key,newValue)
  {
      // console.log($scope.selected);
      if (key==='Height')
      {
        $scope.selected.Feet = parseInt($scope.selected.Feet);
        $scope.selected.Inches = parseInt($scope.selected.Inches);
        $scope.selected.Height = $scope.selected.Feet * 12 + $scope.selected.Inches;
        var sqlQuery = "Update Players SET Height = "+($scope.selected.Height)+ " WHERE ";
      }
      else
      {
        var sqlQuery = "UPDATE "+tableName+" SET "+key+"="+newValue+" WHERE ";
      }
      if (tableName === 'Players')
      {
        sqlQuery += "Player_id="+$scope.selected.Player_id;
      }
      else if (tableName === 'HighSchools') {
        sqlQuery += "HS_id="+$scope.selected.HS_id;
      }
      for(var i = 0; i < $scope.players.length; i++)
      {
        if ($scope.players[i].Player_id === $scope.selected.Player_id)
        {
          $scope.players[i] = $scope.selected;
        }
      }
      console.log(sqlQuery);
      runQuery(sqlQuery);
  };
}]);