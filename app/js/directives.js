'use strict';

angular.module('kanbanter.directives', []).
	directive('kanbanColumn', function () {
		return {
			restrict: 'E',
			templateUrl: 'templates/kanbanColumn.html',
			replace: true,
			scope: {
				title: '@header',
				issues: '=issues'
			},
			controller: KanbanColumnController
		};
	}).directive('jquiDraggable', function () {
		return {
			link : function (scope, item, attrs) { 
				item.draggable({
					addClass: true,
					revertDuration: 200,
					revert: true
				});
			}
		};
	}).directive('jquiDroppable', function () {
		return {
			link : function (scope, target, attrs) {
				target.droppable({
					addClass: true,
					over: function (event, ui) {
						target.addClass('jqui-dnd-target-over');
						ui.draggable.addClass('jqui-dnd-item-over');
					},
					out: function (event, ui) {
						target.removeClass('jqui-dnd-target-over');
						ui.draggable.removeClass('jqui-dnd-item-over');
					},
					drop: function (event, ui) {
						$('.jqui-dnd-target-over').removeClass('jqui-dnd-target-over');
						$('.jqui-dnd-item-over').removeClass('jqui-dnd-item-over');
						var elementScope = ui.draggable.scope();
					}
				});
			}
		};
	});
