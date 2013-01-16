'use strict';


// Declare app level module which depends on filters, and services
angular.module('kanbanter', ['kanbanter.filters', 'kanbanter.services', 'kanbanter.directives'])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: LoginController});
		$routeProvider.when('/', {templateUrl: 'partials/kanban.html', controller: KanbanController});
		$routeProvider.otherwise({redirectTo: '/login'});
	}])
	.run(function ($rootScope, $location) {
		// If there's already a user in localStorage, add them to the $rootScope.
		if(window.localStorage) {
			var user = JSON.parse(window.localStorage.getItem('user'));
			if(user) {
				$rootScope.user = user;
			}
		}
	});
