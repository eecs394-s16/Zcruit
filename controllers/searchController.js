angular.module('zcruit').controller('searchController', ['$scope', '$location', '$http', '$uibModal', '$log', function($scope, $location, $http, $uibModal, $log) {

  var defaultSearch = 'SELECT * FROM Players p, HighSchools h, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.AreaCoach_id = c.Coach_id';
  var coach = 1;
  $scope.sortParam = 'FirstName';
  $scope.sortReverse = false;

  // Called when an option is selected from the lists drop-down
  $scope.showList = function() {
    var list = $scope.selectedList;
    if (list.List_id === 0) {
      // "Search Results" selected
      runSearch(defaultSearch);
    } else {
      // Any other list selected
      runSearch("SELECT * FROM Players p, HighSchools h, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.AreaCoach_id = c.Coach_id AND p.Player_id IN (" + list.Player_ids.join(",") + ") ORDER BY FIELD (p.Player_id, " + list.Player_ids.join(",") + ")");
    }
  };

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

  $scope.boolToText = function(bool) {
    return bool === '0' ? 'No' : 'Yes';
  };

  $scope.setSelectedPlayer = function(player) {
    $scope.selected = player;

    if (player.Zscore >= 8.5) {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is strongly likely to commit.";
    } else if (player.Zscore >= 5.5) {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is moderately likely to commit.";
    } else {
      $scope.zscoreExplanation = "A score of " + player.Zscore + " means this player is unlikely to commit.";
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
      if ($scope.selectedList && $scope.selectedList.List_id !== 0) {
        // Results already ordered! Don't do any sorting
        $scope.sortParam = '';
        $scope.sortReverse = false;
      } else {
        // It's just a regular search, so just sort regularly
        $scope.sortParam = 'FirstName';
        $scope.sortReverse = false;
      }
      $scope.setSelectedPlayer($scope.players[0]);

      var offerQueryString = "SELECT *  FROM Players p, Colleges c, College_status cs WHERE p.Player_id = cs.Player_id AND c.College_id = cs.College_id";
      // get offers for all players
      runQuery(offerQueryString, function(responseColleges){

          for(var i = 0; i < $scope.players.length; i++)
          {
            // for each player, loop through the array of colleges and add on anything that works
            currentPlayer = $scope.players[i];
            $scope.players[i].offers = Array();
            for (var j = 0; j < responseColleges.length; j++)
            {
              if (responseColleges[j].Player_id === currentPlayer.Player_id)
              {
                $scope.players[i].offers.push('../img/college_logos/'+encodeURIComponent(responseColleges[j].College_name)+'.gif');
                console.log($scope.players[i].offers.slice(-1));
              }
            }
          }
      });
      console.log($scope.players);
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
          console.log(playerList);
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

    modalInstance.result.then(function (searchParams) {
      runSearch(buildSearchQuery(searchParams));
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  runSearch(defaultSearch);

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

function buildSearchQuery(params) {
  var query = 'SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id AND p.AreaCoach_id = c.Coach_id';

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

angular.module('zcruit').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance,$timeout, items, lodash) {

  $scope.items = items;

  $scope.advancedFilters = false;
  $scope.showAdvancedFilters = function () {
    $scope.advancedFilters = !$scope.advancedFilters;
  };

  $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
    });

  //Range slider config
  $scope.zscoreSlider = {
      minValue: 0,
      maxValue: 10,
      options: {
          floor:0,
          ceil: 10,
          step: 0.5,
          precision: 0.5,
          noSwitching: true
      }
  };

  $scope.checkboxModel = {
       includePredicted : false,
     };


  $scope.settings_dropdown = {
    scrollableHeight: '150px',
    scrollable: true
  };

  $scope.positionModel = [];
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

  $scope.statusModel = [];
  $scope.statusData = [
    {id:0, label: "0 - Commit"},
    {id:1, label: "1 - Offer"},
    {id:2, label: "2 - Active recruit"},
    {id:3, label: "3 - Evaluation needed"},
    {id:4, label: "4 - FBS recruit"},
    {id:5, label: "5 - Walk on"},
    {id:6, label: "6 - Reject"}
  ];

 $scope.yearModel = [];
  $scope.yearData = [
    {id:2015, label: 2015},
    {id:2016, label: 2016},
    {id:2017, label: 2017},
    {id:2018, label: 2018},
    {id:2019, label: 2019},
    {id:2020, label: 2020}
  ];

  $scope.heightSlider = {
      minValue: 60,
      maxValue: 84,
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
      minValue: 150,
      maxValue: 400,
      options: {
          floor:150,
          ceil: 400,
          step: 10,
          noSwitching: true
      }
  };


 $scope.stateModel = [];
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

 $scope.coachModel = [];
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
      minValue: 1.0,
      maxValue: 4.0,
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
    var returnParams = {};
    returnParams = {
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
    console.log(returnParams);
    $uibModalInstance.close(returnParams);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

});
