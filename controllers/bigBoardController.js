var defaultSearch = 'SELECT DISTINCT * FROM Players p, HighSchools h, Positions pos, Coaches c WHERE p.HighSchool_id = h.HS_id AND p.Player_id = pos.Player_id AND p.AreaCoach_id = c.Coach_id';


angular.module('zcruit').controller('bigBoardController', ['$scope','$location','$http','$timeout',function($scope,$location,$http,$timeout) {

  var coach = 1;
  $scope._ = _;
  $scope.NU_statuses = [
    {value: "0", text: 'Committed'},
    {value: "1", text: 'Offer'},
    {value: "2", text: 'Active Recruit'},
    {value: "3", text: 'Evaluation needed'},
    {value: "4", text: 'FBS recruit'},
    {value: "5", text: 'Walk on'},
    {value: "6", text: 'Rejected'}
  ];

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
    //MODIFY THIS TO REACH YOUR OWN SERVER 
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

  runQuery(defaultSearch + ' ORDER BY Position_name, Position_rank',
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

    var id = player.Player_id;
    noteQuery = "select Notes.Note_txt as txt, Coaches.Coach_name as c, Coaches.Coach_id c_id, DATE(Notes.Note_timestamp) date from Notes join Coaches on Notes.Coach_id=Coaches.Coach_id WHERE Notes.Player_id= " + id +  " ORDER BY Note_timestamp DESC";
    runQuery(noteQuery, function(response) {
      if (response.length > 0) {
        $scope.selected.notes = response;
      }
    });

    getSavedLists(true);
  };
  
  // --------- Add and remove from lists ---------
  var selectingAll = false;

  // Custom text for the add to list button
  $scope.listSelectText = {
    checkAll: "Add to all",
    uncheckAll: "Remove from all",
    buttonDefaultText: "Add to lists"
  };

  // Settings for the dropdown
  $scope.settings_dropdown_player = {
    scrollableHeight: '250px',
    scrollable: true,
    smartButtonMaxItems: 1,
    smartButtonTextConverter: function(itemText, originalItem) {
      var listCount = $scope.selected.listModel.length;
      return 'In ' + listCount + ' list' + (listCount > 1 ? 's' : '');
    }
  };

  $scope.onListSelect = function(item) {
    // If the add new list option was selected
    if (item.id == 1) {
      // Don't allow a checkmark next to the add new list option
      $scope.selected.listModel.pop();
      // Check all attempts to select the add new list option
      // We don't want to add new list popup to appear when this happens
      if (selectingAll) {
        selectingAll = false;
        return;
      }
      $scope.newListPopoverIsOpen = true;
    } else {
      $scope.savePlayer($scope.selected,item.id);
      getSavedLists();
    }
  };

  $scope.onListUnselectAll = function() {
    for (var i = 0; i < $scope.selected.listModel.length; i++) {
      $scope.onListDeselect($scope.selected.listModel[i]);
    }
  };

  $scope.onListSelectAll = function() {
    selectingAll = true;
    // onListSelect already gets called for all of the list items, so no need to save any players here
  };

  $scope.onListDeselect = function(item) {
    if (item.id === 1) {
      return;
    }

    var index = item.id.Player_ids.indexOf(parseInt($scope.selected.Player_id));
    while (index > -1) {
      item.id.Player_ids.splice(index, 1);
      index = item.id.Player_ids.indexOf(parseInt($scope.selected.Player_id));
    }

    runQuery('UPDATE SavedLists SET Player_ids = "' + item.id.Player_ids.join() + '" WHERE List_id = ' + item.id.List_id, function() {
      getSavedLists();
    });
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
      list.Player_ids.push(parseInt(player.Player_id, 10));
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
          player.notes = [];
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
  function getSavedLists(updateListModel) {
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

      if (updateListModel === true) {
        $scope.selected.listData = [{id:1,label:"+ Add New List +"}];
        $scope.selected.listModel = [];

        for (var i = 0; i < $scope.savedLists.length; i++) { 
          $scope.selected.listData.push({
              id:   $scope.savedLists[i],
              label: $scope.savedLists[i].List_name
          });
          var playersInList = $scope.savedLists[i].Player_ids;

          if (playersInList.indexOf(parseInt($scope.selected.Player_id)) > -1) {
            $scope.selected.listModel.push({
              id:   $scope.savedLists[i]
            });
          }
        }
      }
    });
  }

  runQuery("SELECT * FROM Colleges ORDER BY College_id", function(response) {
    $scope.Colleges = response;
  });

  $scope.formatDate = function(){
      var d = new Date(),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
  	};

  $scope.onTextClick = function ($event) {
            $event.target.select();
  };
  $scope.addNote = function(txt)
  {
    // var txt = $scope.newNotePrompt;
    // console.log($scope.newNotePrompt);
    //adds a new note
    var newNote = {}
    // remove any whitespace at the end
    txt = txt.trim();
    if (txt)
    {
      newNote.txt = txt;
      newNote.date = $scope.formatDate();
      // hard coad the coach id to a random between 1 and 6
      var coaches = ['','Pat Fitzgerald','Morty Schapiro','Eric Schulz','Barack Obama','Henry Bienen','Michael Jordan','George Washington']
      newNote.c_id =Math.floor(Math.random() * 7+1);
      newNote.c = coaches[newNote.c_id] ;
      newNote.p = $scope.selected.Player_id;

      //adds at the beginning of the array
      $scope.selected.notes.unshift(newNote);
      //now fix to fit in mysql
      txt = txt.replace('"','""');
      txt = txt.replace("'","''");
      // update the player
      for(var i = 0; i < $scope.players.length; i++)
      {
        if ($scope.players[i].Player_id === $scope.selected.Player_id)
        {
          $scope.players[i] = $scope.selected;
        }
      }
      var insertNoteQuery = "INSERT INTO Notes (Note_timestamp, Player_id,Coach_id,Note_txt) VALUES (NOW(),"+newNote.p+','+newNote.c_id+",'"+txt+"')";
      console.log(insertNoteQuery)
      runQuery(insertNoteQuery);
      $scope.newNotePrompt = '';
      $('#new_note_input').val('');
    }
  };

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
        if (key==='Phone' | key==='Weight' | key==='GPA' | key==='Hometown_zip' | key==='NU_status'){
          var sqlQuery = "UPDATE "+tableName+" SET "+key+"="+newValue+" WHERE ";
        }
        else{
          var sqlQuery = "UPDATE "+tableName+" SET "+key+"='"+newValue+"' WHERE ";
        }

      }
      if (tableName === 'Players')
      {
        sqlQuery += "Player_id="+$scope.selected.Player_id;
      }
      else if (tableName === 'HighSchools') {
        sqlQuery += "HS_id="+$scope.selected.HS_id;
      }

      for (var i=0; i< $scope.positions[$scope.selected.Position_name].length; i++)
      {
        if ($scope.positions[$scope.selected.Position_name][i].Player_id === $scope.selected.Player_id)
        {
          $scope.positions[$scope.selected.Position_name][i] = $scope.selected;
        }
      }
      console.log(sqlQuery);
      runQuery(sqlQuery);
  };
}]);
