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
    jQuery.getJSON(redmineBaseUrl + 'issues.json?sort=priority:desc,created_on:desc&limit=100&project_id=29&status_id=!5&key=' + $rootScope.user.apiCode + "&callback=?",
        function (data) {
            $scope.issues = data.issues;
            $scope.$apply();
        }
    );

	// Set up filters:
	(function () {
		var currentUser = $rootScope.user.id;
		var activeStatus = 1;
		var suspendedStatus = 11;
        var otherCategory = 16;
        var designTracker = 6;
		var inProgress = 2;
		var readyForTesting = 17;
		var testing = 18;
		var ready = 10;

        //Неназначенные и низкоприоритетные
		$scope.noDev = function (ticket) {
            return (!ticket.assigned_to || !ticket.assigned_to.id || (!ticket.priority || ticket.priority.id < 4))
        }

        //Дизайн
        $scope.design = function (ticket){
            return (ticket.tracker && ticket.tracker.id == designTracker)
        }

        //Назначенные и в новые
		$scope.developmentReady = function (ticket) {
            return ticket.assigned_to && ticket.assigned_to.id
                 && (!ticket.category || ticket.category.id != otherCategory)
                 && (ticket.status.id === activeStatus || ticket.status.id === suspendedStatus)
                 && (ticket.tracker && ticket.tracker.id != designTracker)
                 && (ticket.priority && ticket.priority.id >= 4)
        }

        //Назначенные и в работе
		$scope.inProgress = function (ticket) {
            return ticket.assigned_to && ticket.assigned_to.id
                 && ticket.status.id === inProgress
                 && (ticket.tracker && ticket.tracker.id != designTracker)
        }

        //Тестируются
		$scope.inTesting = function (ticket)      {
            return ticket.status.id == readyForTesting || ticket.status.id == testing;
        }

        //Выложенны и ожидют анализа
		$scope.waitingReview = function (ticket)       { return ticket.status.id == ready; }


	})();
	
	// Return ticket custom field value
	$scope.getTicketCustomField = function (ticket, fieldId) {

        if (ticket.category && ticket.category.id) {
            return ticket.category.id;
        }

		return null;
	}


    $scope.handleDrop = function(elementScope, scope) {
        console.log(elementScope, scope);
    };

	$scope.logout = handleLogout;
}
LoginController.$inject = ['$scope', '$http', '$rootScope', '$location'];
