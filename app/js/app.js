'use strict';

// Declare app level module which depends on filters, and services
angular.module('angdrop', [
  'ngRoute',
  'angdrop.filters',
  'angdrop.services',
  'angdrop.directives',
  'angdrop.controllers',
  'goangular', //goAngular
  'ngCookies'
]).
config(function($routeProvider, $goConnectionProvider) {
  $routeProvider.when('/index', {templateUrl: 'partials/index.html', controller: 'MyCtrl1'});
  $routeProvider.when('/create', {templateUrl: 'partials/create.html', controller: 'MyCtrl2'});
  $routeProvider.when('/chat', {templateUrl: 'partials/chat.html',  controller: 'ChatCtrl'});
  $routeProvider.when('/drop/:dropkey', {templateUrl: 'partials/drop.html',  controller: 'DropCtrl'});
  $routeProvider.otherwise({redirectTo: '/index'});

  $goConnectionProvider.$set('https://goinstant.net/b57a53839217/my-application');
})
