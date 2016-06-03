Zcruit - College Football Recruitment Management System
====================================
## DESCRIPTION
Zcruit is a management system for college football recruitment. This app is intended to be used by football team coaches and recruiters. The app is optimized for iPads. 

On this app, you can:
* View and edit profiles of all prospective football players in the database
* Filter players by different criteria (e.g. positions played, location of high school) to find targeted players
* See the prediction of how likely a player will commit to school based on his Zcruit score*
* Easily move a player’s ranking in his position compared to other recruits by using drag-and-drop
* Add players into customized categories

Note:
*The current Zcruit scores are fake and don't match with the actual algorithm 
## Requirements
This app is built with HTML, CSS, AngularJS, and PHP. The back-end works with the query.php file and the database (zcruit.sql). 

Run `git clone https://github.com/eecs394-s16/Zcruit.git` to clone the project.

Back-end requirements:
* MySQL and PHP server 
* Install the database from either `db/zcruit.sql` or use a database uploader to load `db/zcruit.csv`. 
* Modify `php/query.php` to connect to your database.
* Modify `controllers/search_profile.js` and `controllers/bigBoardController.js` to reach your version of `php/query.php`. 
* Start the server and make sure `php/query.php` is reachable.

Front-end requirements 

Open on `views/big_board.html` on your browser to view the project, or access them on your own server. 

Note: In order to see the popovers in your browser, you might need to run a simple Python server to serve the files locally.
* For Python2.x: run `python -m SimpleHTTPServer`
* For Python3.x: run `python -m http.server`
* Open your browser and navigate to `localhost:8000/views/big_board.html`

Recommended browsers
* Google Chrome (Enable "Toggle Device mode" when inspecting the page, and choose "iPad" as your device)
* Safari via computer
* Safari via Xcode iPad Retina simulator

## Contributors
* [Kristen Amaddio](https://github.com/kmads)
* [Shawn Caeiro](https://github.com/shawncaeiro)
* [Aiqi Liu](http://github.com/aiqiliu)
* [Bruno Peynetti](https://github.com/bpeynetti)
* [William Xiao](https://github.com/PaeP3nguin)

