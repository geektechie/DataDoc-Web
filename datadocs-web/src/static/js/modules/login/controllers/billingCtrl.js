define(['./module', 'common', 'jquery'], function (controllers, cc, $) {
  'use strict';

  controllers.controller('billingCtrl',['$scope','$http', '$timeout', '$state', 'User', 'StripeService', function($scope, $http, $timeout, $state, User, StripeService) {
    // navigate user to landing page if already done with subscription
    if(User.hasFinishedSubscription()){
       $state.go('main');
       return;
    }

    $scope.user = User.getCurrent();
    console.log($scope.user, "USER");
    $scope.user.subscriptionQuantity = 3;

    $scope.setPlanType = function(planType){
      $scope.user.planType = planType;
    }

    $scope.user.accountType = 'INDIVIDUAL';
    $scope.user.planType = 'FREE';
    $scope.user.subscriptionQuantity= 3;


    $scope.insufficientQuantity = function(){
        return $scope.user.subscriptionQuantity < 3;
    }

    $scope.accountTypeChanged = function(accountType){
      if(accountType == 'INDIVIDUAL'){
        $scope.user.planType = 'FREE';
      }else{
        $scope.user.planType = 'MONTHLY';
      }
      $scope.submitted=false;
      $scope.billingForm.$invalid=false;

    }

    $scope.isIndividual = function(){
      return $scope.user.accountType=='INDIVIDUAL';
    }

    $scope.isFreePlan = function(){
      return $scope.user.planType == 'FREE';
    }

    $scope.subscribe=false;
    var card;

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
    var style = {
      base: {
        color: '#32325d',
        lineHeight: '40px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
          fontWeight: '500'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    $scope.showCardError = function(cardDom, cardError){
      if(cardError.code == 'incorrect_number'){
        cardDom.textContent = 'We could not process the card number. Please try again or enter another one.';
      }else{
        cardDom.textContent = cardError.message;
      }
      $scope.billingForm.$invalid = true;
      $scope.inRequest = false;
      $scope.$apply();
    }

    function billingDetails(accountType, companyName, source, planType, subscriptionQuantity){
      return {accountType: accountType, companyName: companyName, source: source, planType: planType, subscriptionQuantity: subscriptionQuantity};
    }

    $timeout( function(){
        // Create an instance of Elements.
        var elements = StripeService.getStripe().elements();
        
        // Create an instance of the card Element.
            card = elements.create('card', {style: style, hidePostalCode: true});

            // Add an instance of the card Element into the `card-element` <div>.
            card.mount('#card-element');

            // Handle real-time validation errors from the card Element.
            card.addEventListener('change', function(event) {
              var displayError = document.getElementById('card-errors');
              if (event.error) {
                $scope.showCardError(displayError, event.error);
              } else {
                displayError.textContent = '';
                $scope.billingForm.$invalid = false;
              }
            });
    }, 500);
    $scope.showOverlay = function(){
      return $scope.inRequest && !$scope.billingForm.$invalid;
    }
    // Handle form submission.
    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function(event) {

      event.preventDefault();
      if($scope.billingForm.$invalid) {
          return;
      }

      if(!$scope.isIndividual() &&  $scope.billingForm.companyName.$invalid) {
            return;
      }

      if(!$scope.isFreePlan() && $scope.insufficientQuantity()){
        return;
      }

      var source = null;
      var subscriptionQuantity = 1;
      if(!$scope.billingForm.$invalid){
        $scope.inRequest = true;
      }

      if(!$scope.isFreePlan()){
          StripeService.createToken(card).then(function(result) {
              if (result.error) {
                var errorElement = document.getElementById('card-errors');
                $scope.showCardError(errorElement, result.error);
              } else {
                if(!$scope.isIndividual()){
                  subscriptionQuantity = $scope.user.subscriptionQuantity;
                }
                source = result.token.id;
                StripeService.subscribe(billingDetails($scope.user.accountType,
                                                            $scope.user.companyName,
                                                            source, $scope.user.planType, subscriptionQuantity)
                            ).then( function(response) {
                                 User.refreshCurrent(response.data);
                                 $scope.inRequest = false;
                                 $state.go("main");
                               }).catch(err => {
                                    $scope.inRequest = false;
                                  }
                               );
            }
          }).catch(err => {
                $scope.inRequest = false;
              }
           );
      }else{
          StripeService.subscribe(billingDetails($scope.user.accountType,
                                                    $scope.user.companyName,
                                                    source, $scope.user.planType, subscriptionQuantity)
                    ).then( function(response) {
                       User.refreshCurrent(response.data);
                       $scope.inRequest = false;
                       $state.go("main");
                    })
                    .catch(err => {
                         $scope.inRequest = false;
                       }
                    );
      }


    });
  }])

});