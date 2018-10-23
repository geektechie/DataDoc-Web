define(['./module'], function (directives) {
    'use strict';
    directive('stripeForm', ['$window',
    function($window) {

      var directive = { restrict: 'E' };
      directive.link = function(scope, element, attributes) {

        var form = angular.element(element);
        var cardEl = form.find('card-element');
        console.log(cardEl);
//        var stripe = Stripe('pk_test_vIUqkRtrtufvDd63xpoHgO50');
//        var elements = stripe.elements();
//        var style = {
//          base: {
//            color: '#32325d',
//            lineHeight: '18px',
//            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
//            fontSmoothing: 'antialiased',
//            fontSize: '16px',
//            '::placeholder': {
//              color: '#aab7c4'
//            }
//          },
//          invalid: {
//            color: '#fa755a',
//            iconColor: '#fa755a'
//          }
//        };
//        var card = elements.create('card', {style: style});
//        card.mount('#card-element');

//        form.bind('submit', function() {
//          var button = form.find('button');
//          button.prop('disabled', true);
//          $window.Stripe.createToken(form[0], function() {
//            button.prop('disabled', false);
//            var args = arguments;
//            scope.$apply(function() {
//              scope.$eval(attributes.stripeForm).apply(scope, args);
//            });
//          });
//        });
      };
      return directive;
    }]);
});
