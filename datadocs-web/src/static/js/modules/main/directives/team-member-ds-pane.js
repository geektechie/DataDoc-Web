define(['./module', 'jquery', 'jquery-ui'], function (directives) {
    'use strict';
    directives.directive('teamMemberDsPane', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'static/templates/include/team-member-ds-pane.html',
            link: function ($scope, $elm, $attr) {
                $elm = $elm.children().first();
                $timeout(function(){
                    if($attr.dsDrag && $attr.dsDrag == 'false'){
                        return;
                    }
                    var memberId = $elm.find(".uid").val();
                    var member = $scope.getMemberById(memberId);
                    if(!member){
                        return;
                    }

                    $elm.draggable({
                        distance: 10,
                        disabled: true,
                        cursorAt: { top: -12, left: -20 },
                        appendTo: 'body',
                        containment: 'window',
                        helper: function(event){
                            if(!isMemberSelected(member)){
                                $scope.$apply(function(){
                                    console.log("team-member-ds-pane - isMemberSelected");
                                    $scope.membersSingleClick(member, event);
                                })
                            }
                            $scope.isSelectionDragged.value = true;
                            //var icon = $scope.getUploadIcon($scope.selectedUploads[0]);
                            return $('<div style="z-index: 2000;"><div class="drag-source-helper"><div class="count">' + $scope.selectedMembers.length + '</div></div></div>')
                        },
                        cancel: ".new-file-name",
                        drag: function(event, ui){
                            $scope.$emit('scroll-container', event);
                        },
                        start: function(event, ui){
                            $scope.$emit('cancel-selection', event);
                        },
                        stop: function(event, ui){
                            $scope.isSelectionDragged.value = false;
                        }
                    });

                    function enableDragging(e){
                        e.originalEvent.dragStarted = true;
                        $elm.draggable('enable');
                        $(window).on('mouseup', function(event){
                            if($elm.data('ui-draggable')) {
                                $elm.draggable('disable');
                            }
                        });
                        $elm.trigger(e);
                        $scope.$emit('cancel-selection');
                    }

                    function isDraggedByNameOrIcon(e){
                        return $(e.originalEvent.target).closest('.drag-handler').length > 0;
                    }

                    function isMemberSelected(u){
                        return !!_.find($scope.selectedMembers, function(member){
                            return member.id === u.id;
                        })
                    }

                    $elm.mousedown(function(e){
                        if(!e.originalEvent.dragStarted) {
                            if ((isMemberSelected(member)
                                  && !(e.originalEvent.ctrlKey || e.originalEvent.metaKey)) || isDraggedByNameOrIcon(e)) {
                                enableDragging(e);
                            }
                        }
                    });
                })
            }
        }
    }]);
});