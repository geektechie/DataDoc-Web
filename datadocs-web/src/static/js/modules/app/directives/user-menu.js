define(['./module', 'lodash', 'common'], function (directives, _, cc) {
    'use strict';
    directives.directive('userMenu', ['$uibModal','$rootScope', '$state', 'User', 'Account', 'FileUploader', '$http', 'WSocket',
        function ($uibModal, $rootScope, $state, User, Account, FileUploader, $http, WSocket) {
            return {
                restrict: 'E',
                templateUrl: 'static/templates/include/user-menu.html',
                compile: function (el, attrs) {
                    return {
                        pre: function ($scope, $elm, $attr) {
                            $scope.avatarUploader = new FileUploader({
                                url: '/api/user/upload_avatar',
                                filters: [{
                                    name: 'onlyImages',
                                    fn: function (item) {
                                        return _.startsWith(item.type, 'image');
                                    }
                                }]
                            });
                        },
                        post: function ($scope, $elm, $attr) {
                            $scope.signedIn = User.isSignedIn;
                            $scope.user = User.getCurrent;
                            Account.getAccount().then(function(response){
                                $scope.freeUserLimit = response.freeUserLimit;
                            });
                            $scope.getUserInitials = User.getUserInitials;

                            $scope.signOut = function () {
                                WSocket.unsubscribe('/user/event/sign_out');
                                User.signOut().then(function () {
                                    $rootScope.loggedInUser = undefined;
                                    if(gapi && gapi.auth2){
                                        var auth2 = gapi.auth2.getAuthInstance();
                                        auth2.signOut().then(function () {
                                          console.log('User signed out.');
                                          $state.go('auth.login');
                                        });
                                    }else{
                                        console.log('Google auth found uninitialized');
                                        $state.go('auth.login');
                                    }
                                });
                            };

                            function changeAvatar(url) {
                                $http.post(`/api/user/change-avatar`, {url})
                                    .then(() => {
                                        User.reinitialize();
                                        cc.notify({message: "User avatar successfully updated.", icon: "success"});
                                        $scope.isUploadingAvatar = false;
                                    }, err => {
                                        cc.notify({message: err.data, icon: "warning"});
                                        $scope.isUploadingAvatar = false;
                                    });
                            }

                            $scope.avatarUploader.onAfterAddingFile = function (item) {
                                item.headers['Datadocs-API-Arg'] = JSON.stringify({fileSize: item.file.size});
                                $scope.avatarUploader.uploadAll();
                                $scope.isUploadingAvatar = true;
                            };

                            $scope.avatarUploader.onSuccessItem = function (item, {url}) {
                                changeAvatar(url);
                            };

                            $scope.isFreeUser = function(){
                                return User.getCurrent().account && User.getCurrent().account.planType === 'FREE';
                            };

                            $scope.showMyAccountDetailsModal = function(){
                                $scope.myAccountDetailsModal = $uibModal.open({
                                    templateUrl: 'static/templates/include/modify-account-details.html',
                                    controller: 'modifyAccountDetailsCtrl',
                                    scope: $scope,
                                    animation: true,
                                    size: 'md'
                                  });
                            };
                        }
                    }
                }
            }
        }]);
});
