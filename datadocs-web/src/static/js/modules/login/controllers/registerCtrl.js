define(['./module', 'common', 'lodash'], function (controllers, cc, _) {
  'use strict';

  controllers.controller('registerCtrl', ['$scope', '$http', '$state', '$stateParams', 'FileUploader','User','$location','Locale',
    function ($scope, $http, $state, $stateParams, FileUploader, User, $location, Locale) {

      $scope.user = {

      };
      $scope.errorMessage = '';

      $scope.account = {
        accountType:'INDIVIDUAL'
      };

      $scope.onAccountChange = function(){
          $scope.registerForm.$setPristine();
          $scope.registerForm.$setUntouched();
          $scope.error = '';
       };

      $scope.uploader = new FileUploader({
        url: '/api/user/upload_avatar',
        filters: [{
          name: 'onlyImages',
          fn: function (item) { return _.startsWith(item.type, 'image'); }
        }]
      });

        $scope.fromJoinCompanyLink = false;
        var invitee = User.inviteeUser;
         if(invitee.email){
              $scope.fromJoinCompanyLink = true;
              $scope.user.email = invitee.email;
              $scope.companyName = invitee.companyName;
          }else{
              $scope.fromJoinCompanyLink = false;
           }

        function prepareUserForRegistration() {
          var userObjToSubmit = {
            username : $scope.user.username,
            fullName: $scope.user.fullName,
            email: $scope.user.email,
            password: $scope.user.password,
            avatarPath: $scope.userAvatar
          };
          if($scope.account.accountType == 'BUSINESS') {
            userObjToSubmit.accountType = 'BUSINESS';
            userObjToSubmit.companyName = $scope.user.companyName;
          }else{
            userObjToSubmit.accountType = 'INDIVIDUAL';
          }
          userObjToSubmit.currency = Locale.getCurrencyCode();
          userObjToSubmit.timezone = Locale.getTimeZone();
          return userObjToSubmit;
        }

      function checkSubscriptionAndRedirect(){
        if(User.hasFinishedSubscription()){
           $state.go('main', $stateParams);
        }else{
           //$state.go('auth.billing', $stateParams);
           $state.go('auth.login', $stateParams);
        }
      }

      // manual registration
      function register() {
        User.signUp($scope.user.username,$scope.user.fullName,$scope.user.email,$scope.user.password,$scope.user.password,$scope.userAvatar).then(function(user) {
          User.resetInviteUser();
          $scope.fromJoinCompanyLink = false;
          $scope.isUploading = false;
          var loggedInUser = User.getCurrent();
          checkSubscriptionAndRedirect();
        }).catch(err => {
          $scope.isUploading = false;
          console.log(err);
          if(err.status == '409'){
            $scope.error = 'User already exists'
          }
        })
      }

      $scope.submit = function () {
        if($scope.registerForm.$valid) {
           register();
        }
      };

      $scope.uploader.onAfterAddingFile = function (item) {
        item.headers['Datadocs-API-Arg'] = JSON.stringify({fileSize: item.file.size});
        $scope.user.image = item;
      };


        // google auth call back
      $scope.options = {
        'onsuccess': function(response) {
                 var profile = response.getBasicProfile();
                 var successServerSignIn = function(gLoggedInUser) {
                     $scope.signingIn = true;
                     checkSubscriptionAndRedirect();
                 };
                 var failServerSignIn = function() {
                   $scope.signingIn = false;
                   $scope.error = "Incorrect login or password";
                   $state.go('auth.register');
                 };
            User.gapiRegister(profile.getEmail(), profile.getName(), Locale.getCurrencyCode(), Locale.getTimeZone()).then(successServerSignIn, failServerSignIn);
        }
      };

      $scope.uploader.onSuccessItem = function (item, {url}) {
        $scope.userAvatar = url;
        register();
      };
    }])
});
