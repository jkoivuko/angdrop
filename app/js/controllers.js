'use strict';

/* Controllers */

angular.module('angdrop.controllers', [])
  .controller('MyCtrl1', [function() {

  }]) // location and scope needs to be as parameters 
  .controller('MyCtrl2', ["$location", "$scope", function($location, $scope) {
  $scope.username = "test";  
  $scope.dropkey = ""+Math.floor(Math.random()*100000000000);

  $scope.create = function(username, hash) {
      alert("creating "+username+hash);
      $location.url("/drop/"+hash);
  }

  }])

