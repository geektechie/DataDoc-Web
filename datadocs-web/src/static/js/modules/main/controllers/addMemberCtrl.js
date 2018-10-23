define(['./module', 'angular', 'common'], function (controllers, angular, common) {
  'use strict';
  controllers.controller('addMemberCtrl', ['$scope', '$rootScope','$http','User','Account',
    function ($scope, $rootScope, $http, User, Account) {

            $scope.member = {
                role:'Member'
            };

            $scope.submitted=false;

            $scope.close=function(){
                $scope.addMemberModal.dismiss();
            }

            $scope.roleSelected = function(r){
              $scope.member.role=r;
            };

            $scope.addMember=function(){
                $scope.submitted = true;
                if($scope.addMemberForm.emailId.$invalid) {
                    return;
                }

                let emailId = $scope.member.emailId;
                let role = $scope.member.role;
                var account =  Account.addMember(emailId, role).then(function(response) {
                $scope.error = '';
                $scope.addMemberModal.dismiss();
               }).catch(err => {
                   if(err.status == '409'){
                     $scope.error = $scope.member.emailId + ' email already belongs to another organization.';
                   }else if(err.status == '402'){
                      $scope.error = 'Maximum number of licenses reached';
                    }else if(err.status == '406'){
                       $scope.error = 'Email already registered in your organization.';
                     }
                 });
            }

            $scope.getAccount=function(){
               var account =  Account.getAccount()
               console.log("Get Account is ");
               console.log(account);
            }

        }]);
    });