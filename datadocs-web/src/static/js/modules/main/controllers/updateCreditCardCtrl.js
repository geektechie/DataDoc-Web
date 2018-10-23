define(['./module', 'angular', 'common'], function (controllers, angular, common) {
  'use strict';
  controllers.controller('updateCreditCardCtrl', ['$scope', '$rootScope','$http','$timeout','User', 'StripeService',
    function ($scope, $rootScope, $http, $timeout, User, StripeService) {

    $timeout( function(){
        $scope.submitted=false;
            // Create an instance of Elements.
            var elements = StripeService.getStripe().elements();


            var card;
            var style = {
              base: {
                color: '#32325d',
                lineHeight: '18px',
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
              $scope.updateCreditCard.$invalid = true;
              $scope.inRequest = false;
              $scope.$apply();
            }

            function updateCreditCardDetails(source){
              return {source: source};
            }


            // Create an instance of the card Element.
            card = elements.create('card', {style: style, hidePostalCode: true});

            // Add an instance of the card Element into the `card-element` <div>.
            card.mount('#UpdateCardElement');

            // Handle real-time validation errors from the card Element.
            card.addEventListener('change', function(event) {
              var displayError = document.getElementById('card-errors');
              if (event.error) {
                $scope.showCardError(displayError, event.error);
              } else {
                displayError.textContent = '';
                $scope.updateCreditCard.$invalid = false;
              }
            });

            // Handle form submission.
            var form = document.getElementById('update-credit-card');
            form.addEventListener('submit', function(event) {
                 event.preventDefault();
                  var source = null;
                  StripeService.createToken(card).then(function(result) {
                      if (result.error) {
                        var errorElement = document.getElementById('card-errors');
                        $scope.showCardError(errorElement, result.error);
                      } else {
                        source = result.token.id;
                        StripeService.updateCard(updateCreditCardDetails(source)
                            ).then( function(response) {
                                 $scope.inRequest = false;
                                 $scope.updateCreditCardModal.dismiss(response.data);
                           }).catch(err => {
                                console.log("Error while updating credit card details");
                                $scope.inRequest = false;
                                $scope.failedError = 'Unable to update credit card, Please try again.';
                              }
                           );
                    }
                  }).catch(err => {
                        $scope.inRequest = false;
                      }
                  );
            });
    },500);

      $scope.closeUpdateCreditCardModal = function(){
          $scope.updateCreditCardModal.dismiss();
      }
        }]);
    });