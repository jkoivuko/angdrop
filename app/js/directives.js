'use strict';

/* Directives */


angular.module('angdrop.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm) {
      elm.text(version);
    };
  }]).
  directive('flash', function($timeout) {
  return {
    restrict: 'AE',
    replace: true,
    templateUrl: 'partials/flash.html',
    scope: {
      msg: '=',
      type: '='
    },
    link: function(scope, elem, attrs) {
      attrs['type'] ? elem.addClass('alert-'+attrs['type']) : elem.addClass('alert-success');
      $timeout(function() {
        scope.msg=null;
      }, 5000);
    }
  }
});

