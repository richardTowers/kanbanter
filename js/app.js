'use strict';


// Declare app level module which depends on filters, and services
angular.module('kanbanter', ['kanbanter.filters', 'kanbanter.services', 'kanbanter.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: LoginController});
    $routeProvider.when('/kanban', {templateUrl: 'partials/kanban.html', controller: KanbanController});
    $routeProvider.otherwise({redirectTo: '/login'});
  }]);
