define(['./module', 'angular', 'common'], function (controllers, angular, common) {
  'use strict';
  controllers.controller('changeEmailCtrl', ['$scope', '$rootScope','$http','User',
    function ($scope, $rootScope, $http, User) {

    $scope.emailCode = false;
    $scope.user = User.getCurrent();
    $scope.emailClicked = false;
    $scope.codeEntered = false;
    $scope.error = '';
    $scope.codeError = '';
    angular.element("#email").blur();

    $scope.sendCode = function(){
        $scope.emailClicked = true;
        if($scope.email == $scope.user.email){
            $scope.error='You have entered same email';
        }
        if(!$scope.email || $scope.email == ''){
            $scope.emailCode = false;
        }else{
            User.sendCode($scope.email).then(function(response){
              $scope.emailCode = true;
            }).catch(err =>{
                if(err.status == '409' && $scope.error==''){
                   $scope.error = 'User already exists';
                }
                $scope.emailCode = false;
            })
        }
      }

      $scope.save = function() {
        $scope.codeEntered = true;
        if(!$scope.code || $scope.code == ''){
            return;
        }else{
           User.changeEmail($scope.code).then(function(response){
             $scope.changeEmailModal.dismiss();
           }).catch(err =>{
               if(err.status == '400'){
                   $scope.codeError = 'Verification code is invalid.';
               }else if(err.status == '410'){
                   $scope.codeError = 'Code is expired, Please try again.';
               }else{
                   $scope.codeError = 'Unable to change email, try again!';
               }
           })
        }
      }

      $scope.closeChangeEmailModal = function(){
          $scope.changeEmailModal.dismiss();
      }
    }]);
});