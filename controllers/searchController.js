var defaultSearch = 'SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id AND p.AreaCoach_id = c.Coach_id';


angular.module('zcruit').controller('searchController', ['$scope', '$location', '$http', '$uibModal', '$log', function($scope, $location, $http, $uibModal, $log) {
  var coach = 1;
  $scope._ = _;

  $scope.initials = function(name) {
    name = name.split(' ');
    return name[0][0] + name[1][0];
  };

  $scope.phoneFormat = function(phone) {
    if (phone) {
      phone = phone.toString();
      return phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6, 10);
    }
  };

  $scope.setSelectedPlayer = function(player) {
    if (player === undefined){
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

  $scope.resultTitle = 'All players';
  $scope.resultClearable = false;

  // Clear whatever search or list is currently active
  $scope.clearSearch = function() {
    runSearch(defaultSearch, function() {
      $scope.resultTitle = 'All players';
      $scope.resultClearable = false;
      resetSearchParams();
    });
  };

  // --------- New list popover ---------
  $scope.newList = function(name) {
    $scope.newListPopoverIsOpen = false;
    if (name) {
      runQuery('INSERT INTO SavedLists (Coach_id, List_name) VALUES (' + coach + ',"' + name + '")', function() {
          getSavedLists();
          // Give user some kind of feedback
      });
    }
  };
  $scope.cancelNewList = function() {
     $scope.newListPopoverIsOpen = false;
  };

  // --------- Sidebar new saved search popover ---------
  $scope.showNewSavedSearchPopover = false;
  $scope.saveSearch = function(name) {
    $scope.showNewSavedSearchPopover = false;
    if (name) {
      var queryString = 'INSERT INTO SavedQueries (Coach_id, name, query) VALUES (' + 1 + ',"' + name + '",' + "'" + JSON.stringify(searchParams) +"')";
      runQuery(queryString, function() {
        console.log("Query saved!");
        getSavedQueries();
      });
    }
  };
  $scope.cancelNewSavedSearch = function() {
    $scope.showNewSavedSearchPopover = false;
  };

  // --------- Sidebar saved searches popover ---------
  $scope.showSavedSearchPopover = false;
  $scope.runSavedSearch = function(search) {
    $scope.showSavedSearchPopover = false; // Close the popover
    searchParams = JSON.parse(search.query);
    runSearch(buildSearchQuery(searchParams), function() {
      $scope.resultTitle = search.name;
      $scope.resultClearable = true; // Show the clear button
    });
  };

  $scope.projectedClassSearch = function() {
    $scope.showSavedSearchPopover = false; // Close the popover
    resetSearchParams();
    runSearch(defaultSearch + ' AND (p.NU_status = 0 OR p.NU_status = 1 AND p.Zscore >= 7.0)', function() {
      $scope.resultTitle = "Projected class";
      $scope.resultClearable = true; // Show the clear button
    });
  };

  $scope.offeredPlayersSearch = function() {
    $scope.showSavedSearchPopover = false; // Close the popover
    resetSearchParams();
    searchParams.statuses = [{id: 1}];
    runSearch(buildSearchQuery(searchParams), function() {
      $scope.resultTitle = "Offered";
      $scope.resultClearable = true; // Show the clear button
    });
  };

  // --------- Sidebar lists popover ---------
  $scope.showListsPopover = false;
  // Called when an option is selected from the lists pop-over
  $scope.showList = function(list) {
    $scope.showListsPopover = false; // Close the popover
    resetSearchParams();
    runSearch(defaultSearch+" AND p.Player_id IN (" + list.Player_ids.join(",") + ")", function() {
      $scope.resultTitle = list.List_name;
      $scope.resultClearable = true; // Show the clear button
    });
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
  function runSearch(queryString, callback) {
    runQuery(queryString + " ORDER BY p.NU_Status, p.Zscore DESC", function(response) {
      // console.table(response);

      // Build connections and position list for each player
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
      if (callback) {
        callback();
      }
    });
  }

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
      $scope.resultTitle = 'Search results';
      $scope.resultClearable = true;
      runSearch(buildSearchQuery(searchParams));
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  runQuery("SELECT * FROM Colleges ORDER BY College_id", function(response) {
    $scope.Colleges = response;
  });

  runSearch(defaultSearch);

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
  return query;
}


// MODAL CONTROLLERS

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

// Make the searchParams a global variable so the previous search is saved after closing modal
var defaultParams = {
      minZscore : 0,
      maxZscore : 10,
      minGpa : 1.0,
      maxGpa : 4.0,
      minHeight : 60,
      maxHeight : 84,
      minWeight : 150,
      maxWeight : 400,
      year : [],
      statuses : [],
      states : [],
      firstName : null,
      lastName : null,
      highSchool : null,
      positions : [],
      coaches : [],
      includePredicted: false
    };
var searchParams;
function resetSearchParams() {
  searchParams = JSON.parse(JSON.stringify(defaultParams));
}
resetSearchParams();

angular.module('zcruit').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance,$timeout, items, lodash) {
  $scope.items = items;

  $scope.firstName = searchParams.firstName;
  $scope.lastName = searchParams.lastName;
  $scope.highSchool = searchParams.highSchool;

  $scope.advancedFilters = false;
  $scope.showAdvancedFilters = function () {
    $scope.advancedFilters = !$scope.advancedFilters;
  };

  $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
    });

  //Range slider config
  $scope.zscoreSlider = {
      minValue: searchParams.minZscore,
      maxValue: searchParams.maxZscore,
      options: {
          floor:0,
          ceil: 10,
          step: 0.5,
          precision: 0.5,
          noSwitching: true
      }
  };

  $scope.checkboxModel = {
       includePredicted : searchParams.includePredicted,
     };


  $scope.settings_dropdown = {
    scrollableHeight: '250px',
    scrollable: true
  };

  $scope.positionModel = searchParams.positions;
  $scope.positionData = [
    {id: 'QB', label: "QB"},
    {id: "RB", label: "RB"},
    {id: "WR", label: "WR"},
    {id: "SB", label: "SB"},
    {id: "G/C", label: "G/C"},
    {id: "OT", label: "OT"},
    {id: "CB", label: "CB"},
    {id: "SAF", label: "SAF"},
    {id: "LB", label: "LB"},
    {id: "D", label: "D"},
    {id: "DT", label: "DT"},
    {id: "ATH", label: "ATH"},
    {id: "K", label: "K"},
    {id: "P", label: "P"},
    {id: "LS", label: "LS"},
    {id: "Walk on", label: "Walk on"}
  ];

  $scope.statusModel = searchParams.statuses;
  $scope.statusData = [
    {id:0, label: "0 - Commit"},
    {id:1, label: "1 - Offer"},
    {id:2, label: "2 - Active recruit"},
    {id:3, label: "3 - Evaluation needed"},
    {id:4, label: "4 - FBS recruit"},
    {id:5, label: "5 - Walk on"},
    {id:6, label: "6 - Reject"}
  ];

 $scope.yearModel = searchParams.year;
  $scope.yearData = [
    {id:2015, label: 2015},
    {id:2016, label: 2016},
    {id:2017, label: 2017},
    {id:2018, label: 2018},
    {id:2019, label: 2019},
    {id:2020, label: 2020}
  ];

  $scope.heightSlider = {
      minValue: searchParams.minHeight,
      maxValue: searchParams.maxHeight,
      options: {
          floor:60,
          ceil: 84,
          step: 2,
          noSwitching: true,
          translate: function(value, sliderId, label) {
            var feet = Math.floor(value/12);
            var inches = value%12
            return feet+"' "+inches+'"'
          }
      }
  };

  $scope.weightSlider = {
      minValue: searchParams.minWeight,
      maxValue: searchParams.maxWeight,
      options: {
          floor:150,
          ceil: 400,
          step: 10,
          noSwitching: true
      }
  };


 $scope.stateModel = searchParams.states;
  $scope.stateData = [
    {id:"AL", label: "AL"},{id:"AK", label: "AK"},{id:"AZ", label: "AZ"},
    {id:"AR", label: "AR"},{id:"CA", label: "CA"},{id:"CO", label: "CO"},
    {id:"CT", label: "CT"},{id:"DE", label: "DE"},{id:"FL", label: "FL"},
    {id:"GA", label: "GA"},{id:"HI", label: "HI"},{id:"ID", label: "ID"},
    {id:"IL", label: "IL"},{id:"IN", label: "IN"},{id:"IA", label: "IA"},
    {id:"KS", label: "KS"},{id:"KY", label: "KY"},{id:"LA", label: "LA"},
    {id:"ME", label: "ME"},{id:"MD", label: "MD"},{id:"MA", label: "MA"},
    {id:"MI", label: "MI"},{id:"MN", label: "MN"},{id:"MO", label: "MO"},
    {id:"MT", label: "MT"},{id:"NE", label: "NE"},{id:"NV", label: "NV"},
    {id:"NH", label: "NH"},{id:"NJ", label: "NJ"},{id:"NM", label: "NM"},
    {id:"NY", label: "NY"},{id:"NC", label: "NC"},{id:"ND", label: "ND"},
    {id:"OH", label: "OH"},{id:"OK", label: "OK"},{id:"OR", label: "OR"},
    {id:"PA", label: "PA"},{id:"RI", label: "RI"},{id:"SC", label: "SC"},{id:"SD", label: "SD"},
    {id:"TN", label: "TN"},{id:"TX", label: "TX"},{id:"UT", label: "UT"},{id:"VT", label: "VT"},
    {id:"VA", label: "VA"},{id:"WA", label: "WA"},{id:"WV", label: "WV"},{id:"WI", label: "WI"},
    {id:"WY", label: "WY"},{id:"Other", label: "Other"}
  ];

 $scope.coachModel = searchParams.coaches;
  $scope.coachData = [
    {id:1, label: "Fitz"},
    {id:2, label: "Morty"},
    {id:3, label: "Shulz"},
    {id:4, label: "Obama"},
    {id:5, label: "Bienen"},
    {id:6, label: "Jordan"},
    {id:7, label: "Washington"}
  ];


  $scope.gpaSlider = {
      minValue: searchParams.minGpa,
      maxValue: searchParams.maxGpa,
      options: {
          floor:1.0,
          ceil: 4.0,
          step: 0.5,
          precision: 1,
          noSwitching: true
      }
  };

  $scope.selected = {
    item: $scope.items[0]
  };



  $scope.ok = function () {
    // build the object to return
    searchParams = {
      minZscore : $scope.zscoreSlider.minValue,
      maxZscore : $scope.zscoreSlider.maxValue,
      minGpa : $scope.gpaSlider.minValue,
      maxGpa : $scope.gpaSlider.maxValue,
      minHeight : $scope.heightSlider.minValue,
      maxHeight : $scope.heightSlider.maxValue,
      minWeight : $scope.weightSlider.minValue,
      maxWeight : $scope.weightSlider.maxValue,
      year : $scope.yearModel,
      statuses : $scope.statusModel,
      states : $scope.stateModel,
      firstName : $scope.firstName,
      lastName : $scope.lastName,
      highSchool : $scope.highSchool,
      positions : $scope.positionModel,
      coaches : $scope.coachModel,
      includePredicted: $scope.checkboxModel.includePredicted
    };
    console.log(searchParams);
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});
