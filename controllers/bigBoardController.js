var defaultSearch = 'SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id AND p.AreaCoach_id = c.Coach_id';


angular.module('zcruit').controller('bigBoardController', ['$scope','$location','$http',function($scope,$location,$http) {

  $scope.toggleSelectVar = false;
  var previousSelected;


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


  // Checks whether a card is selected, opening and closing the profile
  $scope.toggleSelect = function(selected){
    // initialize previousSelected as the first player you click
    if (previousSelected == undefined){
      previousSelected = selected;
    }

    // If you click the same card twice, toggle the display on and off
    if (selected.Player_id == previousSelected.Player_id){
      $scope.toggleSelectVar = !$scope.toggleSelectVar;
    }
    
    // Whenever you click a new card, display the profile
    else{
      $scope.toggleSelectVar = true;
    }
    // store previousSelected as the player you just clicked
    previousSelected = selected;

  }
  
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

  var coach = 1;
  $scope.defaultSortParam = ['NU_status', '-Zscore'];
  $scope.sortReverse = false;
  $scope._ = _;

  // Called when an option is selected from the lists drop-down
  $scope.showList = function() {
    var list = $scope.selectedList;
    if (list.List_id === 0) {
      // "Search Results" selected
      runSearch(defaultSearch);
    } else {
      // Any other list selected
      runSearch(defaultSearch+" AND p.Player_id IN (" + list.Player_ids.join(",") + ") ORDER BY FIELD (p.Player_id, " + list.Player_ids.join(",") + ")");
    }
  };

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

  $scope.setSelectedPlayer = function(player) {
    if (player == undefined){
      $scope.noResult = true;
    }
    else{
      $scope.noResult = false;
      $scope.selected = player;

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

  $scope.showSavedSearchPopover = false;
  $scope.runSavedSearch = function(search) {
    searchParams = JSON.parse(search.query);
    runSearch(buildSearchQuery(searchParams));
    $scope.showSavedSearchPopover = false;
  };

  $scope.projectedClassSearch = function() {
    searchParams = defaultParams;
    runSearch(defaultSearch + ' AND (p.NU_status = 0 OR p.NU_status = 1 and p.Zscore >= 7.0)');
    $scope.showSavedSearchPopover = false;
  };

  $scope.offeredPlayersSearch = function() {
    searchParams = defaultParams;
    searchParams.statuses = [{id: 1}];
    runSearch(buildSearchQuery(searchParams));
    $scope.showSavedSearchPopover = false;
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

  // Returns a promise that resolves to the response object
  function runQueryAsync(queryString) {
    return $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query=' + encodeURIComponent(queryString));
  }

  // Update the search results with a query string
  function runSearch(queryString) {
    runQuery(queryString, function(response) {
      // console.table(response);

      // Build connections and position list for each player
      // console.table(response);
      var playerDict = {};
      var playerArray = [];
      for (var i = 0, l = response.length; i < l; i++) {
        var player = response[i];
        var id = player.Player_id;
        if (id in playerDict) {
          // append to end of position name any new ones
          playerArray[playerDict[id]].Position_name += ', ' + player.Position_name;
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
          playerArray.push(player);
          playerDict[id] = playerArray.length - 1;
        }
      }

      $scope.players = playerArray;
      if ($scope.selectedList && $scope.selectedList.List_id !== 0) {
        // Results already ordered! Don't do any sorting
        $scope.sortParam = '';
        $scope.sortReverse = false;
      } else {
        // It's just a regular search, so just sort regularly
        $scope.sortParam = ['NU_status', '-Zscore'];
        $scope.sortReverse = false;
      }

      $scope.setSelectedPlayer($scope.players[0]);
      var offerQueryString = "SELECT *  FROM Players p, Colleges c, College_status cs WHERE p.Player_id = cs.Player_id AND c.College_id = cs.College_id";
      // get offers for all players
      runQuery(offerQueryString, function(responseColleges){

          for(var i = 0; i < $scope.players.length; i++)
          {
            //set feet and inches for each
            $scope.players[i].Feet = Math.floor($scope.players[i].Height/12);
            $scope.players[i].Inches = $scope.players[i].Height%12;
            // for each player, loop through the array of colleges and add on anything that works
            var currentPlayer = $scope.players[i];
            $scope.players[i].offers = Array();
            for (var j = 0; j < responseColleges.length; j++)
            {
              if (responseColleges[j].Player_id === currentPlayer.Player_id)
              {
                $scope.players[i].offers.push({id: responseColleges[j].College_id, img_path: '../img/college_logos/'+encodeURIComponent(responseColleges[j].College_name)+'.gif'});
                // console.log($scope.players[i].offers.slice(-1));
              }
            }
          }
      });
      // console.log($scope.players);
    });
  }
  
  $scope.reorder = function(event, pos, newIndex, oldIndex) {
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

  // Retrieve the saved queries from the server
  function getSavedQueries() {
    runQuery("SELECT * FROM SavedQueries",
      function(savedSearches) {
        $scope.savedSearches = savedSearches;
      });
  }

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.openSearchModal = function (size) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function() {
      runSearch(buildSearchQuery(searchParams));
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.openSaveModal = function (size) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'saveQuery.html',
      controller: 'saveQueryCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
    modalInstance.result.then(function (queryName) {
      var queryString = 'INSERT INTO SavedQueries (Coach_id, name, query) VALUES (' + 1 + ',"' + queryName + '",' + "'" + JSON.stringify(searchParams) +"')";
      console.log(queryString);
      runQuery(queryString, function() {
        console.log("saved into table");
        getSavedQueries();
      });
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  runQuery("SELECT * FROM Colleges ORDER BY College_id", function(response) {
    $scope.Colleges = response;
  });

  $scope.openPastQueryModal = function (size) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'pastQuery.html',
      controller: 'pastQueryCtrl',
      size: size,
      resolve: {
        // This actually seems to resolve and return the promise D:
        queryResponse: function () {
          return runQueryAsync("SELECT * FROM SavedQueries");
        }
      }
    });
  };

  runSearch(defaultSearch+" ORDER BY p.NU_Status, p.Zscore DESC");

  getSavedLists();
  getSavedQueries();

  $scope.openBigBoard = function() {
    window.open('big_board.html', '_self');
  }

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

function buildSearchQuery(params) {
  var query = defaultSearch;
  if (params.includePredicted) {
      query += ' AND ( (p.Zscore BETWEEN ' + params.minZscore + ' AND ' + params.maxZscore + ') OR (p.Zscore2 BETWEEN ' + params.minZscore + ' AND ' + params.maxZscore + ') )';
  }
  else {
      query += ' AND p.Zscore BETWEEN ' + params.minZscore + ' AND ' + params.maxZscore;
  }
  query += ' AND p.GPA BETWEEN ' + params.minGpa + ' AND ' + params.maxGpa;
  query += ' AND p.Height BETWEEN ' + params.minHeight + ' AND ' + params.maxHeight;
  query += ' AND p.Weight BETWEEN ' + params.minWeight + ' AND ' + params.maxWeight;

  if (params.year && params.year.length) {
    query += ' AND p.Year in (' + params.year[0].id;
    for (var i = 1, l = params.year.length; i < l; i++) {
      query += ',' + params.year[i].id + '';
    }
    query += ')';
  }
  if (params.statuses && params.statuses.length) {
    query += ' AND p.NU_status in (' + params.statuses[0].id + '';
    for (var i = 1, l = params.statuses.length; i < l; i++) {
      query += ',"' + params.statuses[i].id + '"';
    }
    query += ')';
  }
  if (params.states && params.states.length) {
    query += ' AND p.Hometown_state in ("' + params.states[0].id + '"';
    for (var i = 1, l = params.states.length; i < l; i++) {
      query += ',"' + params.states[i].id + '"';
    }
    query += ')';
  }
  if (params.firstName) {
    query += ' AND p.FirstName LIKE "' + params.firstName + '%"';
  }
  if (params.lastName) {
    query += ' AND p.LastName LIKE "' + params.lastName + '%"';
  }
  if (params.highSchool) {
    query += ' AND h.HS_name LIKE "' + '%' + params.highSchool + '%"';
  }
  if (params.positions && params.positions.length) {
    query += ' AND pos.Position_name in ("' + params.positions[0].id + '"';
    for (var i = 1, l = params.positions.length; i < l; i++) {
      query += ',"' + params.positions[i].id + '"';
    }
    query += ')';
  }
  if (params.coaches && params.coaches.length) {
    query += ' AND p.AreaCoach_id in (' + params.coaches[0].id;
    for (var i = 1, l = params.coaches.length; i < l; i++) {
      query += ',' + params.coaches[i].id + '';
    }
    query += ')';
  }
  // console.log(query);
  query += " ORDER BY p.NU_status, p.Zscore DESC";
  return query;
};