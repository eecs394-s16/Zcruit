var app = angular.module('zcruit', ['ngAnimate', 'ui.bootstrap','rzModule','ngLodash','angularjs-dropdown-multiselect','xeditable','slip']);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});
