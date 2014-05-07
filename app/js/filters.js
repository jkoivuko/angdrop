'use strict';

/* Filters */

angular.module('angdrop.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);

angular.module('peerjsFilters', []).
  filter('peerjsConnected', function() {
    return function(input) {
      var arr = angular.element.grep(input, function( element ) {
          return (element.peerjsaddr);
        });
      return arr;
    };
  });


