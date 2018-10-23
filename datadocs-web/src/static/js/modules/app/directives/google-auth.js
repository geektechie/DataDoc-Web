define(['./module'], function (directives) {
    'use strict';
    directives.directive(
        'googleAuth',
            function() {
               return {
                 scope: {
                   buttonId: '@',
                   options: '=',
                   mode: '@',
                   title: '@'
                 },
                 templateUrl: 'static/templates/auth/google-auth.html',
                 link: function(scope, element, attrs) {

                        if(!scope.title){
                            scope.title = 'Google';
                        }

                        var initializer = function(){
                                            // TODO: fetch client id from backend
                                            let onAuthFailureCallBack = function(e) { console.log(e); };

                                            var auth2 = gapi.auth2.init({
                                              client_id: '221124010544-bpf0ernqa026kmdgo45ne0o7op30mvhh.apps.googleusercontent.com',
                                              cookiepolicy: 'single_host_origin',
                                            });

                                            var signInOptions = {
                                                                   scope: 'profile email https://www.googleapis.com/auth/contacts.readonly',
                                                                   prompt: 'consent',
                                                                   appPackageName: 'datadocs'
                                                                };

                                            if(scope.mode && scope.mode == 'login')
                                            {
                                               signInOptions = {};
                                            }

                                           auth2.attachClickHandler(
                                           document.getElementById('gAuthBtn'),
                                           signInOptions,
                                           scope.options['onsuccess'],
                                           onAuthFailureCallBack);
                                          };
                        gapi.load('auth2', initializer);
                 }
               };
        });
});
