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
      $('.table-wrapper').scrollTop($('.table-wrapper').children().height());
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
.controller('DropCtrl', ['$cookieStore', '$goKey', '$scope', '$goUsers', '$routeParams', '$window',
  function($cookieStore, $goKey, $scope, $goUsers, $routeParams, $window) {

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
       if ($scope.users.hasOwnProperty(key) && key.charAt(0) != "$") {
         //console.log(key, $scope.users[key].peerjsaddr);
         $scope.conns.push($scope.users[key].peerjsaddr);
       }
     });
     // and finally remove the local user...
     $scope.conns.splice(angular.element.inArray($scope.users.$local.peerjsaddr, $scope.conns), 1);  
  };

  // add peerjs address
  var peer;
  var activeConnections = {};

  peer = $window.Peer([], {key: '8ca5kfjq662sm7vi',
    config: {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' },
    //{ url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
  ]}});

  var peerjs;

  console.log('starting peer connection');
  peer.on('open', function(id) {
    console.log('My peerjs ID is: ' + id);
    peerjs = id;
  });
  peer.on('error', function(err) {
    console.log(err);
  });

  $scope.users.$sync();


  // sync ready
  $scope.users.$on('ready', function() {

    console.log('sync ready users');
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


  $scope.createConnections = function() {
    console.log('conns is ' + $scope.conns);

    for (var n  = 0; n < $scope.conns.length; n++) {
      var peer_address = $scope.conns[n];;
      console.log('connecting to '+peer_address);

      var f = peer.connect(peer_address, { label: 'file', reliable: true });

      f.on('open', function() {
        console.log('connection in progress.....');
        peer_connect(f); // ?
      });
      f.on('error', function(err) { console.log(err); });

      activeConnections[peer_address] = 1;
    }
  };

  $scope.users.$on('leave', function(user) {
    // Handle a user leaving
    delete activeConnections[user.id.guest];

  });

  var peer_connect = function (c) {
    if (c.label === 'file') {
      c.on('data', function(data) {
        console.log('you are getting file');
        // If we're getting a file, create a URL for it.
        if (data.constructor === ArrayBuffer) {
          var dataView = new Uint8Array(data);
          var dataBlob = new Blob([dataView]);
          var url = window.URL.createObjectURL(dataBlob);
          angular.element('#box').append('<div><span class="file">' + c.peer + ' has sent you a <a target="_blank" href="' + url + '">file</a>.</span></div>');
        }
      });
    }
   //connectedPeers[c.peer] = 1;
  };

  // Await connections from others
  peer.on('connection', peer_connect);

  function doNothing(e){
    e.preventDefault();
    e.stopPropagation();
  }

  // Prepare file drop box.
  var box = angular.element('#box');
  box.on('dragenter', doNothing);
  box.on('dragover', doNothing);
  box.on('drop', function(e){
    console.log('file dropped');
    e.originalEvent.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];
    // TODO: notify user about the file

    // start transferring
    eachActiveConnection(function(c, $c) {
      if (c.label === 'file') {
        c.send(file);
        console.log('you sent a file');
        // TODO add notificantion about sent file
        //$c.find('.messages').append('<div><span class="file">You sent a file.</span></div>');
      }
    });

  });

  function eachActiveConnection(fn) {

    console.log('connections: ' + activeConnections);
    //console.log("testing "+$scope.users.$local.displayName);

    var checkedIds = {};

    // selected conns from checklist, we also have internal 
    // value for this TODO refactor. 
    var actives = $scope.conns;
    console.log(actives);

    // todo fix
    for (var n = 0; n < actives.length; n++) {
      console.log('peers i see ' + actives[n]);      
      var peerId = actives[n];
      console.log("connections " + peer.connections[peerId] );

      if (!checkedIds[peerId]) {
        var conns = peer.connections[peerId];
        for (var i = 0, ii = conns.length; i < ii; i += 1) {
          var conn = conns[i];
          console.log('this is :'+angular.element(this)); // changed $(this)
          fn(conn, angular.element(this));
        }
      }

      checkedIds[peerId] = 1;
    }
  }



}]);

