'use strict';

// Some config, to be shared between the controllers:
var assignee = {
	unassigned : 3
};
var statuses = {
	active: 1,
	review: 7,
	resolved: 3,
	closed: 5
};
var redmineBaseUrl = 'http://redmine.richard-towers.com/';


function LoginController($scope, $http, $rootScope, $location) {
	function setData(apiCode, user) {
		$rootScope.apiCode = apiCode;
		$rootScope.user = user;
	}
	if(window.localStorage) {
		$scope.apiCode = window.localStorage.getItem('apiCode');
		if($scope.apiCode != null) {
			$http.get(redmineBaseUrl + 'users/current.json?key=' + $scope.apiCode).success(function (data) {
				setData($scope.apiCode, data.user);
				$location.path('/kanban');
			});
		}
	}
	$scope.login = function() {
		$http.get(redmineBaseUrl + 'users/current.json?key=' + $scope.apiCode).success(function (data) {
			if(window.localStorage) {
				window.localStorage.setItem('apiCode', $scope.apiCode);
			}
			setData($scope.apiCode, data.user);
			$location.path('/kanban');
		});
	}
}
LoginController.$inject = ['$scope', '$http', '$rootScope', '$location'];


function KanbanController($scope, $http, $rootScope, $location) {
	if($rootScope.apiCode == null) {
		$location.path('/login');
		return;
	}
	var key = $rootScope.apiCode;
	$http.get(redmineBaseUrl + 'users/current.json?key=' + key).success(function (data) {
		$rootScope.apiCode = key;
		$rootScope.user = data.user;
	});
	$scope.logout = function() {
		localStorage.clear();
		$location.path('/login');
		return;
	};
	$scope.username = $rootScope.user.firstname + ' ' + $rootScope.user.lastname;
	$http.get(redmineBaseUrl + 'issues.json?status_id=*&key='+key).success(function(data) {
		var issues = data.issues;
		// Backlog: Active and assigned to Dev Queue Unassigned:
		$scope.backlog = _.filter(issues, function(x) {
			return x.status.id === statuses.active && x.assigned_to.id === assignee.unassigned;
		});
		// Backlog: Active and not assigned to Dev Queue Unassigned:
		$scope.inProgress = _.filter(issues, function(x) {
			return x.status.id === statuses.active && x.assigned_to.id !== assignee.unassigned;
		});
		// Review: Status = Review and assigned to Dev Queue Unassigned:
		$scope.review = _.filter(issues, function(x) {
			return x.status.id === statuses.review && x.assigned_to.id === assignee.unassigned;
		});
		// ReviewDone: Status = Review and not assigned to Dev Queue Unassigned:
		$scope.reviewDone = _.filter(issues, function(x) {
			return x.status.id === statuses.review && x.assigned_to.id !== assignee.unassigned;
		});
		// InTesting: Status = Resolved
		$scope.inTesting = _.filter(issues, function(x) {
			return x.status.id === statuses.resolved;
		});
		// Complete: Status = Complete
		$scope.complete = _.filter(issues, function(x) {
			return x.status.id === statuses.closed;
		});
	}).error(function(data) {
		console.log(data);
		window.alert('Oh No! Something went wrong!');
	});
}
KanbanController.$inject = ['$scope', '$http', '$rootScope', '$location'];

function KanbanColumnController($scope, $http, $rootScope) {
	$scope.handleDrop = function (ticketScope, endColumnScope) {
		var userId = $rootScope.user.id;
		var startColumnScope = ticketScope.$parent;
		if(startColumnScope.title === endColumnScope.title) {
			// Nothing to do:
			return;
		}

		if(true){//window.confirm('This will update ticket #' + ticketScope.issue.id + '. Are you sure?')) {
			var indexOfTicketToRemove = startColumnScope.issues.indexOf(ticketScope.issue);
			startColumnScope.issues.splice(indexOfTicketToRemove, 1);
			endColumnScope.issues.push(ticketScope.issue);
			startColumnScope.$apply();
			endColumnScope.$apply();

			var assignedTo;
			var statusId;
			switch(endColumnScope.title) {
				case 'Backlog':
					assignedTo = assignee.unassigned;
					statusId = statuses.active;
					break;
				case 'In Progress':
					assignedTo = userId;
					statusId = statuses.active;
					break;
				case 'Review':
					assignedTo = assignee.unassigned;
					statusId = statuses.review;
					break;
				case 'Review Done':
					assignedTo = userId;
					statusId = statuses.review;
					break;
				case 'In Testing':
					assignedTo = userId;
					statusId = statuses.resolved;
					break;
				case 'Complete':
					assignedTo = null;
					statusId = statuses.closed;
					break;
			}
			var update = { issue : { status_id: statusId } };
			if(assignedTo !== null) { update.issue.assigned_to_id = assignedTo; }

			$http.put(redmineBaseUrl + 'issues/' + ticketScope.issue.id + '.json?key='+$rootScope.apiCode, update).
				error(function (data) {
					console.log(data);
					window.alert('Oh No! Something went wrong!');
				});
		}
	}
}
KanbanColumnController.$inject = ['$scope', '$http', '$rootScope'];