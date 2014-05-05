'use strict';

/* Controllers */

angular.module('angdrop.controllers', [])
  .controller('MyCtrl1', [function() {

  }]) // location and scope needs to be as parameters 
  .controller('MyCtrl2', ["$goUsers", "$cookieStore", "$location", "$scope", function($goUsers, $cookieStore, $location, $scope) {

  $scope.username = "Guest " + Math.floor(Math.random()*1000);  
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

      $location.url("/drop/"+dropkey);
      });

  }

  }])
  .controller('ChatCtrl', ["$cookieStore", "$goKey", "$scope", function($cookieStore, $goKey, $scope) {

  // 'chat' is the key for this chat in goInstance db
  $scope.messages = $goKey('chat').$sync();
  alert($cookieStore.get("dropkey"));

  $scope.messages.$on('add', {
    local: true,
    listener: scrollOn
  });

  $scope.messages.$on('ready', scrollOn);

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

  function scrollOn() {
    setTimeout(function() {
      $('.table-wrapper').scrollTop($('.table-wrapper').children().height());
    }, 0);
  }

}])
.controller('DropCtrl', ["$cookieStore", "$goKey", "$scope", "$goUsers", "$routeParams", 
  function($cookieStore, $goKey, $scope, $goUsers, $routeParams) {
  
  // TODO add modal to change Guest name if accessing direct link
  var roomId = $routeParams.dropkey

  
  $scope.messages = $goKey(roomId).$sync();

  // Create a users model and sync it
  $scope.users = $goUsers(roomId).$sync();

  // not needed
  /*$scope.users.$on('ready', function() {
    // Do something once the user model is synchronized
  });

  $scope.users.$on('join', function(user) {
    //
  });

  $scope.users.$on('leave', function(user) {
    // Handle a user leaving
  });*/


}])

