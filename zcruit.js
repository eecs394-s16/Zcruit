var app = angular.module('zcruit', ['ngAnimate', 'ui.bootstrap','rzModule','ngLodash','angularjs-dropdown-multiselect','xeditable']);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});
