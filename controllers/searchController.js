angular.module('zcruit').controller('searchController', ['$scope', '$location', '$http', function($scope, $location, $http) {


  $scope.initials = function(name) {
    name = name.split(' ');
    return name[0][0] + name[1][0];
  };

  $scope.phoneFormat = function(phone) {
    if (phone) {
      return phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6, 10)
    }
  };

  $scope.boolToText = function(bool) {
    return bool === '0' ? 'No' : 'Yes';
  }

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

  $http.get('https://zcruit-bpeynetti.c9users.io/php/query.php?query=' + encodeURIComponent('SELECT * FROM Players p, HighSchools h, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.AreaCoach_id = c.Coach_id'))
  .then(function(response) {
    $scope.players = eval(response.data);
    $scope.setSelectedPlayer($scope.players[0]);
  });

  $scope.test = "hi";

  $scope.zscorePopover = {
    templateUrl: 'zscore_popover.html',
    title: "Zcruit Score"
  }

  $scope.openBigBoard = function() {
    window.open('big_board.html', '_self');
  }
}]);

function buildSearchQuery(params) {
  var query = 'SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id';

  query += ' AND p.Zscore BETWEEN ' + params.minZscore + ' AND ' + params.maxZscore;
  query += ' AND p.GPA BETWEEN ' + params.minGpa + ' AND ' + params.maxGpa;
  query += ' AND p.Height BETWEEN ' + params.minHeight + ' AND ' + params.maxHeight;
  query += ' AND p.Weight BETWEEN ' + params.minWeight + ' AND ' + params.maxWeight;

  if (params.year) {
    query += ' AND p.Year in (' + params.year[0].id;
    for (var i = 1, l = params.year.length; i < l; i++) {
      query += ',' + params.year[i].id + '';
    }
    query += ')';
  }
  if (params.statuses) {
    query += ' AND p.NU_status in (' + params.statuses[0].id + '';
    for (var i = 1, l = params.statuses.length; i < l; i++) {
      query += ',"' + params.statuses[i].id + '"';
    }
    query += ')';
  }
  if (params.states) {
    query += ' AND p.Hometown_state in ("' + params.states[0].id + '"';
    for (var i = 1, l = params.states.length; i < l; i++) {
      query += ',"' + params.states[i].id + '"';
    }
    query += ')';
  }
  if (params.firstName) {
    query += ' AND p.FirstName = ' + params.firstName + '%';
  }
  if (params.lastName) {
    query += ' AND p.LastName = ' + params.lastName + '%';
  }
  if (params.highSchool) {
    query += ' AND h.HS_name = ' + '%' + params.highSchool + '%';
  }
  if (params.positions) {
    query += ' AND pos.Position_name in ("' + params.positions[0].id + '"';
    for (var i = 1, l = params.positions.length; i < l; i++) {
      query += ',"' + params.positions[i].id + '"';
    }
    query += ')';
  }
  if (params.coaches) {
    query += ' AND p.AreaCoach_id in (' + params.coaches[0].id;
    for (var i = 1, l = params.coaches.length; i < l; i++) {
      query += ',' + params.coaches[i].id + '';
    }
    query += ')';
  }

  return query;
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

angular.module('zcruit').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance,$timeout, items, lodash) {

  $scope.items = items;

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
      coach : $scope.coachModel
    };
    console.log(returnParams);
    $uibModalInstance.close(returnParams);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
