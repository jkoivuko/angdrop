//service style, probably the simplest one
angular.module('peerjsServices', []).service('peerjsService', function($window) {

  //console.log('hello from peerjs service');

  var peer;
  var peerjs;
  var conns;
  var activeConnections = {};

  peer = $window.Peer([], {key: '8ca5kfjq662sm7vi',
    config: {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' },
    //{ url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
  ]}});


  console.log('starting peer connection');

  // service functions
  this.getPeerjsAddr = function() {
    return peerjs;
  }
  this.getPeerjs = function() {
    return peer;
  }
 
  this.createConnections = function(connections) {
    console.log('conns is ' + connections);
    conns = connections;

    for (var n  = 0; n < conns.length; n++) {
      var peer_address = conns[n];;
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
  this.disconnect = function(peer) {
    // TODO check if something else
    delete activeConnections[peer];
  }


  // internal
  function doNothing(e){
    e.preventDefault();
    e.stopPropagation();
  }

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
  };

  var eachActiveConnection = function (fn) {

    console.log('connections: ' + activeConnections);
    var checkedIds = {};

    for (var peerId in activeConnections) {
      console.log('peers i see ' + peerId);
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


  // events
  peer.on('open', function(id) {
    console.log('My peerjs ID is: ' + id);
    peerjs = id;
  });
  peer.on('error', function(err) {
    console.log(err);
  });

  peer.on('connection', peer_connect);

    // todo change this in to the controller
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

});

