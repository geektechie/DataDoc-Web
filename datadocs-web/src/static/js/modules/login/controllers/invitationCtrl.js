define(['./module', 'common', 'jquery'], function (controllers, cc) {
  'use strict';

  controllers.controller('invitationCtrl',['$scope','$http','User','$state','$stateParams', function($scope, $http,User,$state,$stateParams) {

    $scope.getUser = function(){

        let hash = $stateParams.hash;

        if(!hash || hash == ''){
            $state.go('auth.register');
            return;
        }

        User.getInviteUser(hash).then(function () {
        console.log('success')
            $state.go('auth.register');
        }).catch(err => {
        console.log('fails')
           User.resetInviteUser();
           $state.go('auth.register');
         });
    }

    $scope.getUser();
  }])

});
