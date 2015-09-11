// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var podradio = angular.module('podradio', ['ionic', 'ngCordova'])

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

    $state.go("prototype");

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
  .state('home', {
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })
  .state('region', {
    templateUrl: 'templates/region.html',
    controller: 'RegionCtrl'
  })
  .state('school', {
    templateUrl: 'templates/school.html',
    controller: 'SchoolCtrl',
    params: { region_id: null}
  })
  .state('podcast', {
    templateUrl: 'templates/podcast.html',
    controller: 'PodcastCtrl',
    params: { school_id: null}
  })
  .state('player', {
    templateUrl: 'templates/player.html',
    controller: 'PlayerCtrl',
    params: { podcast: null}
  });
});

podradio.controller('HomeCtrl', function( $scope, $state ){

    $scope.browse = function(){
        $state.go("region");
    };

});
podradio.controller('RegionCtrl', function( $scope, $state, api ){

    $scope.regions = null;

    api.get_region_list($scope);

    $scope.school = function( region_id ){
        console.log("REGION ID: ", region_id);
        $state.go("school", {region_id: region_id});
        //api.get_school_list($scope, region_id);
    };

});

podradio.controller('SchoolCtrl', function( $scope, $state, api, $stateParams ){

    $scope.schools = null;

    var region_id = $stateParams.region_id;
    console.log("region_id: ", region_id);

    api.get_school_list($scope, region_id);

    $scope.podcast = function(school_id){
        $state.go("podcast", {school_id: school_id});
    };

});

podradio.controller('PodcastCtrl', function( $scope, $state, api, $stateParams ){

    $scope.podcasts = null;

    var school_id = $stateParams.school_id;
    console.log("school_id: ", school_id);

    api.get_school_podcasts($scope, school_id);

    $scope.player = function(podcast){
        $state.go("player", {podcast: podcast});
    };

});

podradio.controller('PlayerCtrl', function( $scope, $state, api, $timeout, $stateParams, $cordovaMedia, $ionicLoading ){

    $scope.podcast = $stateParams.podcast;
    console.log("$scope.podcast: ", $scope.podcast);
    $scope.data = { 'volume' : '0' };
    var timeoutId = null;
    $scope.$watch('data.volume', function() {
        console.log('Has changed');
        if(timeoutId !== null) {
            console.log('Ignoring this movement');
            return;
        }
        console.log('Not going to ignore this one');
        timeoutId = $timeout( function() {
            console.log('It changed recently!');
            $timeout.cancel(timeoutId);
            timeoutId = null;
            // Now load data from server 
        }, 1000);  
    });


    $scope.media = null;
    $scope.loading = "not loading";
    $scope.duration = "0";
    $scope.progress = "0";
    $scope.progress_perc = "0";
    var timerDur = null;
    var mediaTimer = null;
    var counter = 0;

    function mediaStatusCallback(status){
      console.log("SRC... AAA ", status);
        /*if(status == 1) {
            conaple.log("starting media");
        } else {
            $scope.loading = "not loading";
            $ionicLoading.hide();
        };
        $scope.$apply();*/
    };

    $scope.play = function(src) {
        console.log("SRC... 1 ", src);

        $scope.loading = "loading...";
        $ionicLoading.show({template: 'Loading...'});

        console.log("...............$scope.media 1");
        console.log($scope.media);
        setTimeout(function(){
              if ($scope.media){
                $scope.media.play();
              }else{

                $scope.media = new Media(src, media_success, media_error, mediaStatusCallback);

                /*console.log("...............$scope.media 2");
                console.log($scope.media);
                counter = 0;
                timerDur = setInterval(function() {
                    counter = counter + 100;
                    if (counter > 10000) {
                        clearInterval(timerDur);
                    }
                    var dur = $scope.media.getDuration();
                    if (dur > 0) {
                        clearInterval(timerDur);
                        $scope.duration = (dur) + " sec";
                        $scope.$apply();
                    }
                }, 100);

                console.log("SRC... 2 ", src)
                $scope.media.play();
                console.log("SRC... 3 ", src);*/
              };
        }, 300);

        /*mediaTimer = setInterval(function() {
            $scope.media.getCurrentPosition(
                function(position) {
                    if (position > -1) {
                        $scope.progress = Math.floor(position) + " sec";
                        $scope.progress_perc = Math.floor( ($scope.progress/$scope.duration)*100 );
                        $scope.$apply();
                    }
                },
                function(e) {
                    console.log("Error getting pos=" + e);
                }
            );
        }, 1000);*/

    };
    

});







/*===========================*/
/* Factories */
/*===========================*/

podradio.factory('api', function( $http ) {

    return {
        get_region_list: function($scope){

            $http.get(global_url+'/api/get_region_list').then(function(resp) {
                console.log("region list response: ", resp);
                $scope.regions = resp.data;
                //return resp.data;
            }, function(err) {
                $scope_var = null;
                //return null;
            });

        },
        get_school_list: function($scope, region_id){
            $http.get(global_url+'/api/get_school_list/'+region_id).then(function(resp) {
                console.log("school list response: ", resp);
                $scope.schools = resp.data;
                //return resp.data;
            }, function(err) {
                $scope.schools = null;
                //return null
            });
        },
        get_school_podcasts: function($scope, school_id){
            $http.get(global_url+'/api/get_school_podcasts/'+school_id).then(function(resp) {
                console.log("podcast list response: ", resp);
                $scope.podcasts = resp.data;
                //return resp.data;
            }, function(err) {
                $scope.podcasts = null;
                //return null
            });
        },
        get_all_podcasts: function(){

        }
    }
});






























podradio.controller('AudioCtrl', function( $scope, $cordovaMedia, $ionicLoading ){

    $scope.media = null;
    $scope.loading = "not loading";
    $scope.duration = "0";
    $scope.mediaPosition = "0";
    var timerDur = null;
    var mediaTimer = null;
    var counter = 0;

    $scope.downloads = JSON.parse(localStorage.getItem("downloads"));

    function mediaStatusCallback(status){
      console.log("SRC... AAA ", status);
      /*$scope.loading = "loading...";
      $ionicLoading.show({template: 'Loading...'});*/
        if(status == 1) {
            /*$scope.loading = "loading...";
            console.log("SRC... 4 ", src)
            $ionicLoading.show({template: 'Loading...'});*/

        } else {
            $scope.loading = "not loading";
            $ionicLoading.hide();
        };
        /*$scope.loading = "not loading";
        $ionicLoading.hide();*/
        $scope.$apply();
    };

    function media_success(){
        console.log("!!!!!..............media success.................!!!!!!");
    };
    function media_error(err){
        console.log("!!!!!..............media error.................!!!!!!");
        console.log(err);
    };

    $scope.stop = function(){
        $scope.media.stop();
        $scope.media = null;
        var timerDur = null;
        var mediaTimer = null;
        var counter = 0;
    };
    $scope.pause = function(){
        $scope.media.pause();
        var timerDur = null;
        var mediaTimer = null;
        var counter = 0;
    };

    $scope.play = function(src) {
        console.log("SRC... 1 ", src);

        $scope.loading = "loading...";
        $ionicLoading.show({template: 'Loading...'});

        console.log("...............$scope.media 1");
            console.log($scope.media);

        // get duration
        setTimeout(function(){

          if ($scope.media){
            $scope.media.play();
          }else{

            $scope.media = new Media(src, media_success, media_error, mediaStatusCallback);

            console.log("...............$scope.media 2");
            console.log($scope.media);

            counter = 0;
            timerDur = setInterval(function() {
                counter = counter + 100;
                if (counter > 10000) {
                    clearInterval(timerDur);
                }
                var dur = $scope.media.getDuration();
                if (dur > 0) {
                    clearInterval(timerDur);
                    $scope.duration = (dur) + " sec";
                    $scope.$apply();
                }
           }, 100);

            console.log("SRC... 2 ", src)
            //$cordovaMedia.play(media);
            $scope.media.play();
            console.log("SRC... 3 ", src);

            /*$scope.loading = "not loading";
            $ionicLoading.hide();*/

          };

        }, 300);

        // get current position
        mediaTimer = setInterval(function() {
        // get media position
        $scope.media.getCurrentPosition(
            // success callback
            function(position) {
                if (position > -1) {
                    //console.log((position) + " sec");
                    $scope.mediaPosition = Math.floor(position) + " sec";
                    $scope.$apply();
                }
            },
            // error callback
            function(e) {
                console.log("Error getting pos=" + e);
            }
        );
    }, 1000);

    };
 
    /*var mediaStatusCallback = function(status) {
        console.log("SRC... AAA ", src)
        if(status == 1) {
            $scope.loading = "loading...";
            console.log("SRC... 4 ", src)
            $ionicLoading.show({template: 'Loading...'});
            console.log("SRC... 5 ", src)
        } else {
            $scope.loading = "not loading";
            console.log("SRC... 6 ", src)
            $ionicLoading.hide();
            console.log("SRC... 7 ", src)
        }
    };*/


    /*==============================*/
    /* DOWNLOAD */
    /*=============================*/

    $scope.filePath = null;
    $scope.podFile = null;

    $scope.download = function(download_link, file_name, category) {
        $ionicLoading.show({
          template: 'Loading...'
        });
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {

            console.log("made it to the requestFileSystem: ", download_link);
            console.log("made it to the requestFileSystem: ", file_name);
            console.log("made it to the requestFileSystem: ", category);

            // var download_link = "http://supernice-staging-b.appspot.com/static/slideshow/sounds/alto.mp3";
            // var file_name = "alto.mp3";
            // var category = "Some School";
            $scope.podFile = null;


            fs.root.getDirectory(
                "PodradioDownloads",
                {
                    create: true
                },
                function(dirEntry) {
                    dirEntry.getFile(
                        file_name, 
                        {
                            create: true, 
                            exclusive: false
                        }, 
                        function gotFileEntry(fe) {
                            var p = fe.toURL();
                            $scope.filePath = p;
                            console.log("FILE PATH ----------------", p);
                            fe.remove();
                            ft = new FileTransfer();
                            ft.download(
                                encodeURI(download_link),
                                p,
                                function(entry) {
                                    $ionicLoading.hide();
                                    //$scope.podFile = entry.toURL();// works for images but not for audio files --> returns url in form file://
                                    $scope.podFile = entry.toInternalURL();// works for everything returns url in form: cdv:///
                                    //$scope.podFile = "ExampleProject/test.mp3";
                                    console.log("podFILE PATH ----------------", $scope.podFile);
                                    var downloads = JSON.parse( localStorage.getItem("downloads") );
                                    var download_obj = {"download_link": download_link, "file_name": file_name, "category": category, "file_path": $scope.podFile};
                                    downloads.push(download_obj);
                                    localStorage.setItem("downloads", JSON.stringify(downloads));
                                    $scope.downloads = downloads;
                                    $scope.$apply();
                                },
                                function(error) {
                                    console.log(error);
                                    $ionicLoading.hide();
                                    //alert("Download Error Source -> " + error.source);
                                },
                                false,
                                null
                            );
                        }, 
                        function() {
                            $ionicLoading.hide();
                            console.log("Get file failed");
                        }
                    );
                }
            );
        },
        function() {
            $ionicLoading.hide();
            console.log("Request for filesystem failed");
        });
    };

/*====================*/
/* Delete File */
/*====================*/
    $scope.delete = function(file_name) {
        $ionicLoading.show({
          template: 'Loading...'
        });
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {

            $scope.podFile = null;


            fs.root.getDirectory(
                "PodradioDownloads",
                {
                    create: true
                },
                function(dirEntry) {
                    dirEntry.getFile(
                        file_name, 
                        {
                            create: true, 
                            exclusive: false
                        }, 
                        function gotFileEntry(fe) {
                            var p = fe.toURL();
                            $scope.filePath = p;
                            console.log("DELETE FILE PATH ----------------", p);
                            fe.remove();
                            var downloads = JSON.parse( localStorage.getItem("downloads") );
                            for (var i=0; i<downloads.length; i++){
                                if( downloads[i]["file_name"] == file_name ){
                                    downloads.splice(i, 1);
                                };
                            };

                            localStorage.setItem("downloads", JSON.stringify(downloads));
                            $scope.downloads = downloads;
                            $scope.$apply();

                            $ionicLoading.hide();

                        }, 
                        function() {
                            $ionicLoading.hide();
                            console.log("Delete - Get file failed");
                        }
                    );
                }
            );
        },
        function() {
            $ionicLoading.hide();
            console.log("Request for filesystem failed");
        });
    }


});

podradio.controller('BrowseCtrl', function( $scope, $ionicLoading, api ){
    $scope.regions = null;
    $scope.schools = null;

    api.get_region_list($scope);

    $scope.school = function(region_id){
        api.get_school_list($scope, region_id);
    };


});

