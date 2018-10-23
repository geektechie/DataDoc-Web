define(['./module', 'jquery', 'angular', 'common', 'lodash'], function (controllers, jquery, angular, common, _) {
    controllers.controller('closeAccountCtrl', ['$scope', '$rootScope', '$state', '$uibModal', 'User',
        function ($scope, $rootScope, $state, $uibModal, User) {

              $scope.user = User.getCurrent();
              $scope.isCompanyOwner = User.isCompanyOwner();

                $scope.closeAccount = function(){
                     User.closeAccount().then(function(response){
                        $scope.closeAccountModal.dismiss();
                        signOut();
                     }).catch(err =>{
                        if(err.status != '200'){
                             console.log('Something went wrong, Please contact to administrator.')
                             $scope.error = 'Something went wrong, Please contact to administrator.';
                         }
                     })
                }

                $scope.cancelCloseAccountModal = function(){
                    $scope.closeAccountModal.dismiss();
                }

                function signOut(){

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
                }


        }]);
});
