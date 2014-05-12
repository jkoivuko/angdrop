'use strict';

/* Controllers */

var app = angular.module('angdrop.controllers', [])
  .controller('MyCtrl1', [function() {

}]) // location and scope needs to be as parameters 
  .controller('MyCtrl2', ['$goUsers', '$location', '$scope', function($goUsers, $location, $scope) {

  $scope.username = 'Guest ' + Math.floor(Math.random()*1000);
  $scope.dropkey = Math.floor(Math.random()*Math.pow(10,10)).toString();

  $scope.create = function(username, dropkey) {
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
.controller('ChatCtrl', ['$goKey', '$scope', function($goKey, $scope) {
  function scrollOn() {
    setTimeout(function() {
      angular.element('.table-wrapper').scrollTop(angular.element('.table-wrapper').children().height());
    }, 0);
  }

  $scope.messages = $goKey('chat').$sync();

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
.controller('DropCtrl', ['$goKey', '$scope', '$goUsers', '$routeParams', 
                         'peerjsService', '$timeout',
  function($goKey, $scope, $goUsers, $routeParams, 
           peerjsService, $timeout) {

  // needed for view and checklist-module
  $scope.conns = [];
  $scope.displayName = "";
  $scope.content;

  var roomId = $routeParams.dropkey;
  // Sync chat messages
  $scope.chat = $goKey('chat').$sync();
  // sync messages from this room
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

  $scope.createConnections = function() { $scope.activeConnections = peerjsService.createConnections($scope.conns); };

  $scope.users.$sync();

  // events

  // this event is called when syncin is ready
  // this however, doesn't mean that $local user is synced
  $scope.users.$on('ready', function() {

    // potential and real async problem here.
    // TODO fix that peerjs is always instanted before goInstant

    var peerjs_promise = peerjsService.getPeerjsAddr();
    peerjs_promise.then(function(peerjs_addr) {
      console.log('sync ready users ');
      console.log('local user has peerjs addr ' + peerjs_addr);
      $scope.users.$local.$key('peerjsaddr').$set(peerjs_addr);
      $scope.users.$local.$sync();
      $scope.displayName = $scope.users.$local.displayName;
    }, function(reason) {
      console.log('reason: '+reason);
    }, function(update) {
      console.log('update: '+update);
    });

  });


  $scope.users.$on('join', function(user) {

    console.log('user joined with name, '+user.displayName);
    $scope.flasher('User joined with name, '+user.displayName, 'success');
    // TODO figure out why this is not showing up?
    console.log('user joined with peerjs addr, '+user.peerjsaddr);
    console.log('user joined with user.id '+user.id);

  });

  $scope.users.$on('leave', function(user) {
    // Handle a user leaving
    peerjsService.disconnect(user.peerjsaddr);

  });

  angular.element('#name').focusout(function() {
    $scope.users.$local.$key('displayName').$set($scope.displayName);
  });
 
  $scope.sendMessage = function() {
    var message = {
      content: $scope.content,
      author: $scope.displayName
    }
    $scope.chat.$add(message).then(function() {
      $scope.content = '';
    });
  }

  $scope.flasher = function(m, t) {
    $scope.msg = m;
    $scope.type= t;
    $timeout.cancel($scope.timer);
    $scope.timer = $timeout(function() {
      $scope.msg = null;
    }, 5000);
  }
  $scope.flasher("Hello, you can change your nick by clicking it on the right.", "info");
}]);

