'use strict';

var redmineBaseUrl = 'http://redmine.richard-towers.com/';

function LoginController($scope, $http, $rootScope, $location) {

	var handleSuccessfulLogin = function handleSuccessfulLogin(user) {
		user.apiCode = $scope.apiCode;
		user.name = user.firstname + ' ' + user.lastname;
		$rootScope.user = user;
		if(window.localStorage) {
			window.localStorage.setItem('user', JSON.stringify(user));
		}
		$location.path('/');
	};

	$scope.login = function login () {
		// Make a get with the api code in the box to see if it's correct:
		$http.get(redmineBaseUrl + 'users/current.json?key=' + $scope.apiCode)
			.success(function (data) { handleSuccessfulLogin(data.user); })
			.error(function () { alert('Oops! Something went wrong.'); });
	};

	// We might have to auto-login
	if($rootScope.user) {
		$location.path('/');
		return;
	}
}
LoginController.$inject = ['$scope', '$http', '$rootScope', '$location'];

function KanbanController($scope, $http, $rootScope, $location) {

	var handleLogout = function handleLogout () {
		$rootScope.user = undefined;
		if(window.localStorage) {
			window.localStorage.removeItem('user');
		}
		$location.path('/login');
	};

	// Check that we have a valid user in context:
	if(!$rootScope.user) {
		handleLogout();
		return;
	}

	// Try and use the user's apiCode to get the issues:
	$http.get(redmineBaseUrl + 'issues.json?status_id=*&key=' + $rootScope.user.apiCode)
		.success(function (data) { $scope.issues = data.issues; })
		.error(function () { alert('Oh no.'); });

	// Set up filters:
	(function () {
		var unassigned = 9;
		var currentUser = $rootScope.user.id;
		var active = 1;
		var review = 7;
		var resolved = 3;
		var closed = 5;
		$scope.backlog = function (ticket) { return ticket.assigned_to.id         === unassigned && ticket.status.id === active; }
		$scope.inProgress = function (ticket) { return ticket.assigned_to.id      !== unassigned && ticket.status.id === active; }
		$scope.developmentDone = function (ticket) { return ticket.assigned_to.id === unassigned && ticket.status.id === review; }
		$scope.review = function (ticket) { return ticket.assigned_to.id          !== unassigned && ticket.status.id === review; }
		$scope.reviewDone = function (ticket) { return ticket.assigned_to.id      === unassigned && ticket.status.id === resolved; }
		$scope.inTesting = function (ticket) { return ticket.assigned_to.id       !== unassigned && ticket.status.id === resolved; }
	})();

	$scope.logout = handleLogout;
}
LoginController.$inject = ['$scope', '$http', '$rootScope', '$location'];