'use strict';

/* Controllers */

angular.module('angdrop.controllers', [])
  .controller('MyCtrl1', [function() {

}]) // location and scope needs to be as parameters 
  .controller('MyCtrl2', ['$goUsers', '$cookieStore', '$location', '$scope', function($goUsers, $cookieStore, $location, $scope) {

  $scope.username = 'Guest ' + Math.floor(Math.random()*1000);
  $scope.dropkey = Math.floor(Math.random()*Math.pow(10,10)).toString();

  $scope.create = function(username, dropkey) {
    //alert("creating "+username+dropkey);
    //$cookieStore.put("username", username);
    //$cookieStore.put("dropkey", dropkey);

    // change the name to goInstant also
    // TODO check if room exists
    $scope.users = $goUsers(dropkey).$sync();
    $scope.users.$self();

    $scope.users.$on('ready', function() {

      $scope.users.$local.$key('displayName').$set(username);
      $scope.users.$local.$key('dropkey').$set(dropkey);

      $location.url('/drop/'+dropkey);
    });

  };

}])
.controller('ChatCtrl', ['$cookieStore', '$goKey', '$scope', function($cookieStore, $goKey, $scope) {
  function scrollOn() {
    setTimeout(function() {
      angular.element('.table-wrapper').scrollTop(angular.element('.table-wrapper').children().height());
    }, 0);
  }


  // 'chat' is the key for this chat in goInstance db
  $scope.messages = $goKey('chat').$sync();
  //alert($cookieStore.get("dropkey"));

  $scope.messages.$on('add', {
    local: true,
    listener: scrollOn
  });

  $scope.sendMessage = function() {
    if(!$scope.newMessage) {
      return;
    }

    $scope.messages.$add({
      content: $scope.newMessage,
      author: $scope.author
    }).then(function() {
      $scope.$apply(function() {
        $scope.newMessage = '';
      });
    });
  };

  $scope.remove = function(id) {
    $scope.messages.$key(id).$remove();
  };

  $scope.messages.$on('ready', scrollOn);

}])
.controller('DropCtrl', ['$cookieStore', '$goKey', '$scope', '$goUsers', '$routeParams', '$window', 'peerjsService',
  function($cookieStore, $goKey, $scope, $goUsers, $routeParams, $window, peerjsService) {

  // needed for view and checklist-module
  $scope.conns = [];

  // TODO add modal to change Guest name if accessing direct link
  // use: https://github.com/tuhoojabotti/AngularJS-ohjelmointiprojekti-k2014/blob/master/material/aloitusluento.md#flash
  var roomId = $routeParams.dropkey;

  $scope.messages = $goKey(roomId).$sync();

  $scope.users = $goUsers(roomId);
  $scope.users.$self();

  // rly, wtf again? I just want the list of users to work with
  $scope.checkAll = function() {
    $scope.conns.length = 0; // empty the array, but keep references to it
    Object.keys($scope.users).forEach(function(key) {
      if ($scope.users.hasOwnProperty(key) && key.charAt(0) !== '$') {
      //console.log(key, $scope.users[key].peerjsaddr);
        if ($scope.users[key].peerjsaddr !== undefined) { // only take if connected to peerjs
          $scope.conns.push($scope.users[key].peerjsaddr);
        }
      }
    });
    // and finally remove the local user...
    $scope.conns.splice(angular.element.inArray($scope.users.$local.peerjsaddr, $scope.conns), 1);
  };

  $scope.createConnections = function() { peerjsService.createConnections($scope.conns); };

  $scope.users.$sync();


  // sync ready
  $scope.users.$on('ready', function() {

    // potential and real async problem here.
    // TODO fix that peerjs is always instanted before goInstant
    var peerjs = peerjsService.getPeerjsAddr();
    console.log('sync ready users ');
    console.log('local user has peerjs addr ' + peerjs);
    $scope.users.$local.$key('peerjsaddr').$set(peerjs);
    $scope.users.$local.$sync();

  });


  $scope.users.$on('join', function(user) {
    //$scope.users.$sync();
    //$scope.users.$on('ready', function() {

    console.log('user joined with name, '+user.displayName);
    // TODO figure out why this is not showing up?
    console.log('user joined with peerjs addr, '+user.peerjsaddr);
    console.log('user joined with user.id '+user.id);
     //});

  });

  $scope.users.$on('leave', function(user) {
    // Handle a user leaving
    peerjsService.disconnect(user.peerjsaddr);

  });


}]);

