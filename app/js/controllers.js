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
  .controller('ChatCtrl', ["$goKey", "$scope", function($goKey, $scope) {

  // 'chat' is the key for this chat in goInstance db
  $scope.messages = $goKey('chat').$sync();
  alert($scope.dropkey);

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

