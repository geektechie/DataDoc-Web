define(['./module', 'jquery'], function (module, jquery) {
    module.service('Locale', ['$http',function ($http) {

       var timeZone = "GMT";
       var currencyCode = 'USD';

        function localeDetails() {
            $.get("https://api.ipdata.co/?api-key=83c1bd53d5e4d1f5be0fe03d8967c966239f85a9286ef47b1b51803c", function (response) {
                    console.log(response);
                    currencyCode = response.currency.code;
                    timeZone = response.time_zone.name;
            });
         }

        localeDetails();

        return {
            getTimeZone: () => timeZone,
            getCurrencyCode: () => currencyCode
        }
    }]);
});