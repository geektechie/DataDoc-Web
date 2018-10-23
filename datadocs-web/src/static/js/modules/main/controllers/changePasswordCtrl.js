define(['./module', 'angular', 'common'], function (controllers, angular, common) {
'use strict';
controllers.controller('changePasswordCtrl', ['$scope', '$rootScope','$http','User',
  function ($scope, $rootScope, $http,User) {

        $scope.changePasswordClicked = false;
        angular.element("#password").blur();

        $scope.closeChangePasswordModal = function(){
            $scope.changePasswordModal.dismiss();
        }

        $scope.changePassword = function(){
          $scope.changePasswordClicked = true;
          $scope.error = '';
          if(!$scope.oldPassword  || $scope.oldPassword == '' || !$scope.newPassword || $scope.newPassword == ''){
              return;
          }else{
              User.changePassword($scope.oldPassword, $scope.newPassword).then(function(response) {
                    $scope.changePasswordModal.dismiss();
               }).catch(err => {
                    if(err.status == '401'){
                        $scope.error = 'Your old password was incorrect.';
                    }else{
                        $scope.error = 'Unable to change password, try again!';
                    }
                   console.log('Change password failed, Reason: ', err);
               });
          }
        }

      }]);
  });