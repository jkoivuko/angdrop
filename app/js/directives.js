'use strict';

/* Directives */


angular.module('angdrop.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm) {
      elm.text(version);
    };
  }]);
