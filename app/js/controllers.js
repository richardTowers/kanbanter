'use strict';

// Controllers


function MyCtrl1() {}
MyCtrl1.$inject = [];


function MyCtrl2($scope, $http) {

	$http.get('redmine/issues.json').success(function(data) {
		var issues = data.issues;
		// Backlog: Active and assigned to Dev Queue Unassigned:
		$scope.backlog = _.filter(issues, function(x) { return x.status.id === 1 && x.assigned_to.id === 189; });
		// Backlog: Active and not assigned to Dev Queue Unassigned:
		$scope.inProgress = _.filter(issues, function(x) { return x.status.id === 1 && x.assigned_to.id !== 189; });
		// Review: Status = Review and assigned to Dev Queue Unassigned:
		$scope.review = _.filter(issues, function(x) { return x.status.id === 8 && x.assigned_to.id === 189; });
		// ReviewDone: Status = Review and not assigned to Dev Queue Unassigned:
		$scope.reviewDone = _.filter(issues, function(x) { return x.status.id === 8 && x.assigned_to.id !== 189; });
		// InTesting: Status = Resolved
		$scope.inTesting = _.filter(issues, function(x) { return x.status.id === 7; });
		// Complete: Status = Complete
		$scope.complete = _.filter(issues, function(x) { return x.status.name === 'Closed'; });
	}).error(function(data) {
		console.log(data);
		window.alert('Oh No! Something went wrong!');
	});

}

MyCtrl2.$inject = ['$scope', '$http'];
