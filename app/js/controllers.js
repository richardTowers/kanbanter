'use strict';

var redmineBaseUrl = 'https://tasks.verumnets.ru/';

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

        jQuery.getJSON(redmineBaseUrl + 'users/current.json?key=' + $scope.apiCode + "&callback=?", function(data){
            alert("ok!");
            handleSuccessfulLogin(data.user);
        });

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
    jQuery.getJSON(redmineBaseUrl + 'issues.json?status_id=*&key=' + $rootScope.user.apiCode + "&callback=?")
		.done(function (data) { $scope.issues = data.issues; });

	// Set up filters:
	(function () {
		var unassigned = 9;
		var currentUser = $rootScope.user.id;
		var active = 1;
		var review = 7;
		var resolved = 3;
		var closed = 5;
		$scope.backlog = function (ticket)         { return ticket.assigned_to.id === unassigned && ticket.status.id === active; }
		$scope.inProgress = function (ticket)      { return ticket.assigned_to.id !== unassigned && ticket.status.id === active; }
		$scope.developmentDone = function (ticket) { return ticket.assigned_to.id === unassigned && ticket.status.id === review; }
		$scope.review = function (ticket)          { return ticket.assigned_to.id !== unassigned && ticket.status.id === review; }
		$scope.reviewDone = function (ticket)      { return ticket.assigned_to.id === unassigned && ticket.status.id === resolved; }
		$scope.inTesting = function (ticket)       { return ticket.assigned_to.id !== unassigned && ticket.status.id === resolved; }
	})();
	
	// Return ticket custom field value
	$scope.getTicketCustomField = function (ticket, fieldId) {
		
		for (var i = 0; i < ticket.custom_fields.length; i++) {
			if(ticket.custom_fields[i].id===Number(fieldId)) { return ticket.custom_fields[i].value; }
		}
		
		// Custom field not found
		return null;
		
	}

	$scope.logout = handleLogout;
}
LoginController.$inject = ['$scope', '$http', '$rootScope', '$location'];
