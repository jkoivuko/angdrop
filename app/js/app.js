'use strict';


// Declare app level module which depends on filters, and services
angular.module('angdrop', [
  'ngRoute',
  'angdrop.filters',
  'angdrop.services',
  'angdrop.directives',
  'angdrop.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/index.html', controller: 'MyCtrl1'});
  $routeProvider.when('/create', {templateUrl: 'partials/create.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);
