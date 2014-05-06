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
  // use: https://github.com/tuhoojabotti/AngularJS-ohjelmointiprojekti-k2014/blob/master/material/aloitusluento.md#flash
  var roomId = $routeParams.dropkey

  $scope.messages = $goKey(roomId).$sync();

  // Create a users model and sync it
  $scope.users = $goUsers(roomId).$sync();
  $scope.users.$self();


  var peer;
 
  $scope.users.$on('ready', function() {

   console.log("sync ready users");

   // TODO currently goInstant will give id {guest: xxxxxx} value.
   var selfid = $scope.users.$local.$key('id').guest;

   console.log("selfid "+selfid);
   peer = new Peer(selfid, {key: '8ca5kfjq662sm7vi',
      config: {'iceServers': [
         { url: 'stun:stun.l.google.com:19302' },
         { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
      ]}
   });

   console.log("staring peer connection");
   peer.on('open', function(id) {
      console.log('My peerjs ID is: ' + id);
      $scope.users.$local.$key('peerjs_addr').$set(id);
   });
   peer.on('error', function(err) {
     console.log(err)
   });


  });


  $scope.users.$on('join', function(user) {
     console.log("user joined with name, "+user.displayName);

     // TODO figure out why this is not showing up?
     console.log("user joined with peerjs addr, "+user.peerjs_addr);

     // again, we are using latter part of the goInstant id
     // for not authenticated users. if user is authenticated, this will not work
     peer.connect(user.id.guest, { label: 'file', reliable: true });
  });

  $scope.users.$on('leave', function(user) {
    // Handle a user leaving
  });




}])

