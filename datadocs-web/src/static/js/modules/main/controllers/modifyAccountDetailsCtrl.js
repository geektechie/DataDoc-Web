define(['./module', 'angular', 'common'], function (controllers, angular, common) {
  'use strict';
  controllers.controller('modifyAccountDetailsCtrl', ['$scope', '$rootScope','$http','$timeout','$uibModal','Account','StripeService','User',
    function ($scope, $rootScope, $http, $timeout, $uibModal, Account,StripeService,User) {

      $scope.madCompanyName = false;
      $scope.account = Account.account;
      $scope.accountDetailsUpdated = false;
      $scope.previousLicenseCount = $scope.account.numberOfLicenses;

      var accType = $scope.account.accountType.charAt(0).toUpperCase() + $scope.account.accountType.toLowerCase().substring(1, $scope.account.accountType.length);

      $scope.member = {
        accountType: accType,
        numberOfLicenses: (!$scope.account.numberOfLicenses || $scope.account.numberOfLicenses == null || $scope.account.numberOfLicenses < 3)? 3 : $scope.account.numberOfLicenses,
        companyName: $scope.account.companyName
      };

      if($scope.account.planType === 'FREE')
           $scope.member.planType='Free for up to 100K rows of data';
      else
           $scope.member.planType='Monthly';

      $scope.accountTypeSelected = function(type){
        $scope.member.accountType=type;
        if(type === 'Business'){
            $scope.member.planType='Monthly';
        }
        manageApplyCost();
      };

      $scope.isMemberAccountTypeBusiness = function(){
        return $scope.member.accountType === 'Business';
      }

      $scope.isMemberPlanTypeMonthly = function(){
        return $scope.member.planType == 'Monthly'
      }

      $scope.isAccountTypeBusiness = function(){
        return $scope.account.accountType === 'BUSINESS';
      }

      $scope.applyCost = false;
      $scope.updatedCharge = 0;
      $scope.planTypeSelected = function(plan){
        $scope.member.planType=plan;
        manageApplyCost();
      };

      function manageApplyCost(){
            if($scope.member.planType == 'Monthly' && accType == 'Individual' ){
                $scope.applyCost = true;
                $scope.updatedCharge = 9.99;
            }
            if($scope.member.planType == 'Monthly' && $scope.member.accountType === 'Business'){
                $scope.applyCost = true;
                $scope.updatedCharge = 9.99*$scope.member.numberOfLicenses;
                console.log($scope.isAccountTypeBusiness);
            }
      }


      $scope.selectUserNumbers = function(licenses){
        $scope.member.numberOfLicenses=licenses;
        manageApplyCost();
      };

      $scope.isWarn = function(){
        if(accType == 'Individual' && $scope.account.planType == 'MONTHLY' &&
            $scope.member.accountType === 'Individual' &&
            $scope.member.planType === 'Free for up to 100K rows of data'){
            return true;
        }
        return false;
      }

      $scope.madAccountType= [
          'Individual',
          'Business'
      ];

      $scope.madUserNumber= [
      ];

      $scope.cardDisplay = function(){
        if($scope.member.planType === 'Monthly' && $scope.account.cardId === null)
            return true;
        else
            return false;
      }

      var x = 3;
      while (x <=100 ){
        $scope.madUserNumber.push(x);
        x++;
      }


      var style = {
              base: {
                color: '#32325d',
                lineHeight: '18px',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                  color: '#aab7c4'
                }
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
              }
      };

      $scope.submitClicked = false;
      $scope.getPlanType = function(){
        return ['Free for up to 100K rows of data','Monthly'];
      }

     $scope.showCardError = function(cardDom, cardError){
          if(cardError.code == 'incorrect_number'){
            cardDom.textContent = 'We could not process the card number. Please try again or enter another one.';
          }else{
            cardDom.textContent = cardError.message;
          }
          $scope.myAccountDetails.$invalid = true;
          $scope.inRequest = false;
          $scope.$apply();
     }

        var card;
        $timeout( function(){
            // Create a Stripe client.
            var elements = StripeService.getStripe().elements();
            card = elements.create('card', {style: style, hidePostalCode: true});
            card.mount('#card-element');

            card.addEventListener('change', function(event) {
              var displayError = document.getElementById('card-errors');
              if (event.error) {
                $scope.showCardError(displayError, event.error);
              } else {
                displayError.textContent = '';
                $scope.myAccountDetails.$invalid = false;
              }
            });
             // Handle form submission.
            var source=null;
            var form = document.getElementById('update-account-form');
            form.addEventListener('submit', function(event) {
              event.preventDefault();

              if($scope.member.planType == 'Free for up to 100K rows of data'){
                  $scope.member.planType='Free';
              }

              if($scope.member.planType == 'Monthly' && $scope.account.cardId == null){
                    StripeService.createToken(card).then(function(result) {
                            if (result.error) {
                              var errorElement = document.getElementById('card-errors');
                              $scope.showCardError(errorElement, result.error);
                            } else {
                              source = result.token.id;
                              $scope.submitClicked = true;
                              Account.modifyAccountDetails($scope.member.accountType,
                                                          $scope.member.companyName,
                                                          $scope.member.planType,
                                                          $scope.member.numberOfLicenses, source)
                              .then(function(response) {
                                Account.getPaymentInfo().then(function(response) {}).catch(err => {
                                      console.log('Error while fetch Payment details', err);
                                  });
                                    User.reinitialize();
                                    $scope.inRequest=true;
                                    $scope.accountDetailsUpdated = true;
                                    $timeout( function(){
                                       $scope.myAccountDetailsModal.dismiss();
                                    },1500);
                              }).catch(err => {
                              console.log(err);
                                    $scope.submitClicked = false;
                                    if(err.data.message){
                                        $scope.failedError = err.data.message;
                                    }else{
                                        $scope.failedError = 'Unable to update account details, Please try again!';
                                    }
                                    $scope.inRequest = false;
                              });
                          }
                        }).catch(err => {
                              $scope.inRequest = false;
                        });
              }else{
                  $scope.submitClicked = true;
                  Account.modifyAccountDetails($scope.member.accountType,
                                      $scope.member.companyName,
                                      $scope.member.planType,
                                      $scope.member.numberOfLicenses,
                                      source)
                      .then(function(response) {
                          Account.getPaymentInfo().then(function(response) {}).catch(err => {
                            });
                            User.reinitialize();
                            $scope.inRequest=true;
                            $scope.accountDetailsUpdated = true;
                            $timeout( function(){
                               $scope.myAccountDetailsModal.dismiss();
                            },1500);

                      }).catch(err => {
                            $scope.submitClicked = false;
                            if(err.data.message){
                                $scope.failedError = err.data.message;
                            }else{
                                $scope.failedError = 'Unable to update account details, Please try again!';
                            }
                            $scope.inRequest = false;
                    });
                   }
              });

        }, 500);

    function licenseCountIncreased() {
        return $scope.member.numberOfLicenses > $scope.previousLicenseCount;
    }

    $scope.getUpgradeDowngradeIndicator = function(){
      if(($scope.member.planType === 'Monthly' && licenseCountIncreased())) {
        return "upgraded";
      }else if($scope.member.planType === 'Monthly' && ($scope.member.numberOfLicenses == $scope.previousLicenseCount)){
        return "upgraded";
      }else{
        return "downgraded";
      }
    }


    $scope.updateAccount = function(){
        $scope.madCompanyName = true;

        if($scope.member.accountType == 'Individual' && $scope.member.planType == 'Monthly')
            $scope.member.numberOfLicenses = 1;

        if($scope.member.planType == 'Free for up to 100K rows of data'){
            $scope.member.numberOfLicenses = 1;
        }

        if(!$scope.member.companyName || $scope.member.companyName == null || $scope.myAccountDetails.$invalid){
            return;
        }
    }

    $scope.closeMyAccountDetailsModal = function(){
            $scope.myAccountDetailsModal.dismiss();
    };

    }]);
});