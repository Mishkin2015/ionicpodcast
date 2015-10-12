// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var podradio = angular.module('podradio', ['ionic', 'controllers', 'ngCordova'])

.run(function($ionicPlatform, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // check localStorage items

    if( !localStorage.getItem("downloads") ){
        localStorage.setItem("downloads", JSON.stringify([]));// initiate an empty array
    };
    if ( localStorage.getItem("registrationID") ){
        $state.go("home");
    }else{
        $state.go("register");
    };

  });
});

/*==========================*/
/* State controller */
/*==========================*/

podradio.config(function($stateProvider) {
  $stateProvider
  .state('prototype', {
    templateUrl: 'templates/prototype.html',
    controller: 'AudioCtrl'
  })
  .state('register', {
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })
  .state('home', {
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl',
    cache: false
  })
  .state('region', {
    templateUrl: 'templates/region.html',
    controller: 'RegionCtrl'
  })
  .state('school', {
    templateUrl: 'templates/school.html',
    controller: 'SchoolCtrl',
    params: { region_id: null, region_name: null}
  })
  .state('podcast', {
    templateUrl: 'templates/podcast.html',
    controller: 'PodcastCtrl',
    params: { school_id: null, school_name: null},
    cache: false
  })
  .state('player', {
    templateUrl: 'templates/player.html',
    controller: 'PlayerCtrl',
    params: { podcast: null, downloaded: null},
    cache: false
  })
  .state('saved', {
    templateUrl: 'templates/saved.html',
    controller: 'SavedCtrl'
  });
});