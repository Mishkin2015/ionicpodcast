
var podradio = angular.module('controllers', []);



podradio.controller('RegisterCtrl', function( $scope, $state, $ionicModal, $http ){

    $scope.loading = false;
    $scope.invalidEmail = false;
    $scope.data = {};

    if ( localStorage.getItem("subscribed") ){
        if ( localStorage.getItem("subscribed") == "no" ){
            $scope.data.subscribed = false;
        }else{
            $scope.data.subscribed = true;
        };
    }else{
        $scope.data.subscribed = true;
    };

    $scope.register = function(){

        $scope.loading = true;

        function validateEmail(email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        };

        var name = $scope.data.name;
        var email = $scope.data.email;

        if ( $scope.data.subscribed ){
            var subscribed = "yes";
        }else{
            var subscribed = "no"
        };

        localStorage.setItem("subscribed", subscribed);

        //console.log("name: ", name);
        //console.log("email: ", email);
        if ( validateEmail(email) ){
            $http({
                method: 'POST',
                url: global_url+'/api/register',
                data: "name=" + name + "&email=" + email + "&subscribed=" + subscribed,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(resp){
                localStorage.setItem("registrationID", resp.data.registration_id);
                $scope.loading = false;
                $state.go("home");
            }, function(resp){
                $scope.loading = false;
                $state.go("home");
                //console.log("error response");
                //console.log(resp);
            });
        }else{
            $scope.invalidEmail = true;
            $scope.loading = false;
        };

    };

    $scope.infoModal = function(podcast) {
        $scope.podcast = podcast;
        $ionicModal.fromTemplateUrl('templates/register-info-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };
    $scope.closeModal = function() {
        if ( $scope.modal ){
            $scope.modal.hide();
        };
    };
      //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
      // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
      // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

});

podradio.controller('HomeCtrl', function( $scope, $state, $ionicHistory, $ionicNavBarDelegate ){

    $ionicHistory.clearHistory();
    $ionicNavBarDelegate.showBackButton(false);

    $scope.browse = function(){
        $state.go("region");
    };

    $scope.savedPodcasts = function(){
        $state.go("saved");
    };

});

podradio.controller("SavedCtrl", function($scope, $state, $ionicLoading, $ionicModal, $ionicNavBarDelegate){

    $ionicNavBarDelegate.showBackButton(true);

    $scope.downloads = JSON.parse( localStorage.getItem("downloads") );

    $scope.player = function(podcast, downloaded){
        podcast["downloaded"] = downloaded;
        $state.go("player", {podcast: podcast, downloaded: downloaded});
    };

    $scope.infoModal = function(podcast) {
        $scope.podcast = podcast;
        $ionicModal.fromTemplateUrl('templates/info-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.closeModal = function() {
        if ( $scope.modal ){
            $scope.modal.hide();
        };
    };
      //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        if ( $scope.modal ){
            $scope.modal.remove();
        };
    });
      // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
      // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

/*====================*/
/* Delete File */
/*====================*/
    /*$scope.delete_bug = function(file_name){
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner><br>' + file_name
        });

        setTimeout(function(){
            $ionicLoading.hide();
        }, 3000);

    };*/

    $scope.delete = function(file_name) {

        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner>'
        });
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {

            $scope.podFile = null;


            fs.root.getDirectory(
                "PodradioDownloads",
                {
                    create: true
                },
                function(dirEntry) {
                    //console.log( "...... dirEntry: ", JSON.stringify(dirEntry) );
                    //console.log("....... file_name: ", file_name);
                    /*file_name = file_name.split("/");
                    console.log(JSON.stringify(file_name))
                    file_name = [file_name.length-1];*/
                    dirEntry.getFile(
                        file_name, 
                        {
                            create: true, 
                            exclusive: false
                        }, 
                        function gotFileEntry(fe) {
                            //console.log( "...... fe: ", fe );
                            var p = fe.toURL();
                            $scope.filePath = p;
                            //console.log("DELETE FILE PATH ----------------", p);
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
                        function(err) {
                            //console.log("ERROR - ", JSON.stringify( err ));
                            $ionicLoading.hide();
                            //console.log("Delete - Get file failed");
                        }
                    );
                }
            );
        },
        function(err) {
            $ionicLoading.hide();
            //console.log("Request for filesystem failed");
        });
    };

});

podradio.controller('RegionCtrl', function( $scope, $state, api, $ionicNavBarDelegate ){

    $ionicNavBarDelegate.showBackButton(true);

    $scope.regions = null;

    api.get_region_list($scope);

    $scope.school = function( region_id, region_name ){
        //console.log("REGION ID: ", region_id);
        $state.go("school", {region_id: region_id, region_name: region_name});
        //api.get_school_list($scope, region_id);
    };

});

podradio.controller('SchoolCtrl', function( $scope, $state, api, $stateParams, $ionicNavBarDelegate ){

    $ionicNavBarDelegate.showBackButton(true);

    $scope.schools = null;

    var region_id = $stateParams.region_id;
    $scope.region_name = $stateParams.region_name;

    //console.log("region_id: ", region_id);

    api.get_school_list($scope, region_id);

    $scope.podcast = function(school_id, school_name){
        $state.go("podcast", {school_id: school_id, school_name:school_name});
    };

});

podradio.controller('PodcastCtrl', function( $scope, $state, api, $stateParams, $ionicModal, $cordovaMedia, $ionicLoading, $ionicNavBarDelegate ){

    $ionicNavBarDelegate.showBackButton(true);

    $scope.podcasts = null;

    var school_id = $stateParams.school_id;
    $scope.school_name = $stateParams.school_name
    //console.log("school_id: ", school_id);

    api.get_school_podcasts($scope, school_id, null);

    $scope.more_podcasts = function(cursor){
        console.log("CURSOR: ", cursor)
        api.get_school_podcasts($scope, school_id, cursor);
    };

    //console.log( JSON.stringify( $scope.podcasts ) );

    $scope.player = function(podcast, downloaded){
        $state.go("player", {podcast: podcast, downloaded: downloaded});
    };

    $scope.infoModal = function(podcast) {
        $scope.podcast = podcast;
        $ionicModal.fromTemplateUrl('templates/info-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };
    $scope.closeModal = function() {
        if ( $scope.modal ){
            $scope.modal.hide();
        };
    };
      //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        if( $scope.modal ){
            $scope.modal.remove();
        };
        //$scope.modal.remove();
    });
      // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
      // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

    /*=====================*/
    /* Download */
    /*=====================*/

    $scope.download = function(download_link, file_name, category, podcast) {
        
        //console.log(" - - - - -  downloading?");

        $scope.podcast = podcast;

        //console.log(" - - - - -  $scope.podcast? ", JSON.stringify( $scope.podcast ));

        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner><br>Downloading to Saved Podcasts'
        });

        //console.log(" - - - - -  $ionicLoading ");

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
                            var p = fe.toInternalURL();
                            $scope.filePath = p;
                            //console.log("FILE PATH ----------------", p);
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
                                    //console.log("podFILE PATH ----------------", $scope.podFile);
                                    var downloads = JSON.parse( localStorage.getItem("downloads") );
                                    var download_obj = {"download_link": download_link, "file_name": file_name, "category": category, "file_path": $scope.podFile, "podcast": $scope.podcast};
                                    downloads.push(download_obj);
                                    localStorage.setItem("downloads", JSON.stringify(downloads));
                                    $scope.downloads = downloads;

                                    // Update podcasts in scope to reflect that its been downloaded
                                    for ( var i=0; i<$scope.podcasts.length; i++ ){
                                        if ( $scope.podcasts[i]["id"] === $scope.podcast.id  ){
                                            $scope.podcasts[i]["downloaded"] = $scope.podFile;
                                        }
                                    };

                                    // track download
                                    try {
                                        api.track_download($scope.podcast.id);
                                    }
                                    catch(err) {
                                        console.log("error: ", err)
                                    };

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
                            //console.log("Get file failed");
                        }
                    );
                }
            );
        },
        function() {
            $ionicLoading.hide();
            //console.log("Request for filesystem failed");
        });
    };


});

podradio.controller('PlayerCtrl', function( $scope, $state, api, $timeout, $stateParams, $cordovaMedia, $ionicLoading, $cordovaSocialSharing, $ionicModal, $ionicNavBarDelegate ){

    $ionicNavBarDelegate.showBackButton(true);

    $scope.media = null;
    $scope.podcast = $stateParams.podcast;
    $scope.downloaded = $stateParams.downloaded;

    api.get_in_app_message($scope);

    $scope.$on('$ionicView.beforeLeave', function(){
        $scope.stop();
    });

    $scope.data = {"backgroundMode": true, 'progress': 0};


    $scope.toggleBackgroundMode = function(){
        //console.log($scope.data);

        if ( cordova.plugins.backgroundMode.isEnabled() && !$scope.data.backgroundMode ){
            cordova.plugins.backgroundMode.disable();
        };

        if ( !cordova.plugins.backgroundMode.isEnabled() && $scope.data.backgroundMode ){
            // enable background audio
            cordova.plugins.backgroundMode.setDefaults({ text:'Tap to go back to Podradio'});
            cordova.plugins.backgroundMode.enable();
        };

    };

    $scope.seeking = false;
    //console.log("$scope.podcast: ", $scope.podcast);

    var timeoutId = null;
    $scope.$watch('data.progress', function() {
        if(timeoutId !== null) {
            return;
        }
        timeoutId = $timeout( function() {
            $timeout.cancel(timeoutId);
            timeoutId = null;
        }, 1000);  
    });

    $scope.touched_seek = function(){
        $scope.seeking = true;
    };
    $scope.released_seek = function(){
        if ( $scope.dur > 0 && $scope.media ){
            //setTimeout(function(){
                var milliseconds =  Math.floor( ( $scope.data.progress * $scope.dur * 1000 ) / 100);
                $scope.media.seekTo(milliseconds);
                //console.log("milliseconds: ", milliseconds);
            //}, 300);
        }else{
            //console.log("NOT going to seek!!!!!!!!");
            $scope.data.progress = 0;
        };
        $scope.seeking = false;
    };


    /*=====================*/
    /* Sharing */
    /*=====================*/
    $scope.share = function(title, link){
        $cordovaSocialSharing.share(title, "Podradio", null, link);
    };

    /*=====================*/
    /* AudioCtrl copy/paste */
    /*=====================*/


    $scope.media = null;
    $scope.loading = "not loading";
    $scope.duration = "00:00";
    $scope.dur = 0;
    $scope.mediaPosition = "00:00";
    $scope.mediaPositionPerc = 0;
    var timerDur = null;
    var mediaTimer = null;
    var counter = 0;

    function mediaStatusCallback(status){
        if(status == 1) {

        } else {
            $scope.loading = "not loading";
            $ionicLoading.hide();
        };
        $scope.$apply();
    };

    function media_success(){
        //console.log("!!!!!..............media success.................!!!!!!");
    };
    function media_error(err){
        //console.log("!!!!!..............media error.................!!!!!!");
        //console.log(err);
    };

    $scope.stop = function(){
        cordova.plugins.backgroundMode.disable();
        $scope.playing = false;
        if ( $scope.media ){
            $scope.media.stop();
        };
        $scope.media = null;
        var timerDur = null;
        var mediaTimer = null;
        var counter = 0;
        $scope.data.progress = 0;
        $scope.mediaPosition = "00:00";
        $scope.media.release();//releases the media form cache
    };
    $scope.pause = function(){
        cordova.plugins.backgroundMode.disable();
        $scope.playing = false;
        $scope.media.pause();
        var timerDur = null;
        var mediaTimer = null;
        var counter = 0;
    };

    function convert_timer(time_sec){
        var minutes = Math.floor( time_sec/60 );
        var seconds = Math.floor( time_sec - ( minutes*60 ) );

        if ( minutes < 0 ){
            minutes = 0;
        };
        if ( seconds < 0 ){
            seconds = 0;
        };

        var string_mins = minutes.toString();
        var string_secs = seconds.toString();
        if ( string_mins.length < 2 ){
            string_mins = "0"+string_mins
        };
        if ( string_secs.length < 2 ){
            string_secs = "0"+string_secs
        };
        var time = string_mins + ":" + string_secs;
        return time
    };

    //if (cordova && cordova.plugins.backgroundMode.isEnabled()){
    if (cordova.plugins.backgroundMode.isEnabled()){
        cordova.plugins.backgroundMode.onactivate = function() {
            /*cordova.plugins.backgroundMode.configure({
                text: "BG mode activated",
            });*/
            // if track was playing resume it
            if( $scope.playing && $scope.data.backgroundMode ) {
                $scope.media.play();
            }else{
                $scope.playing = false;
                $scope.media.pause();
                var timerDur = null;
                var mediaTimer = null;
                var counter = 0;
            };
        };
    };

    $scope.play = function(src) {
        $scope.playing = true;
        
        if ( $scope.data.backgroundMode ) {
            // enable background audio
            cordova.plugins.backgroundMode.setDefaults({ text:'Tap to go back to Podradio'});
            cordova.plugins.backgroundMode.enable();
        };

        $scope.loading = "loading...";

        $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});

        setTimeout(function(){
          if ($scope.media){

            $scope.media.play();

            /*try {
                api.track_play($scope.podcast.id);
            }
            catch(err) {
                console.log("tracking error error error: ", err)
            };*/

          }else{

            $scope.media = new Media(src, media_success, media_error, mediaStatusCallback);
            counter = 0;
            timerDur = setInterval(function() {
                counter = counter + 100;
                if (counter > 10000) {
                    clearInterval(timerDur);
                }
                var dur = $scope.media.getDuration();
                if (dur > 0) {
                    clearInterval(timerDur);
                    $scope.duration = convert_timer(dur);
                    $scope.dur = dur;
                    $scope.$apply();
                }
           }, 100);

            $scope.media.play({ playAudioWhenScreenIsLocked : true });

            try {
                api.track_play($scope.podcast.id);
            }
            catch(err) {
                console.log("tracking error error error: ", err)
            };

          };

        }, 300);
        mediaTimer = setInterval(function() {
        $scope.media.getCurrentPosition(
            function(position) {
                if (position > -1) {
                    $scope.mediaPosition = convert_timer(position);
                    $scope.mediaPositionPerc = Math.floor( ( position / $scope.media.getDuration() )*100 );
                    
                    if ( !$scope.seeking ){
                        $scope.data = { 'progress' : $scope.mediaPositionPerc, "backgroundMode" : $scope.data.backgroundMode };
                        //if ( position >= $scope.dur && position != 0 ){
                        if ( position >= $scope.dur ){
                            /*$scope.data = { 'progress' : 100, "backgroundMode" : $scope.data.backgroundMode };
                            $scope.pause();*/
                            $scope.data = { 'progress' : 0, "backgroundMode" : false };
                            $scope.stop();
                        };
                    };
                    
                    $scope.$apply();
                }else{
                    $scope.mediaPosition = convert_timer(0);
                    $scope.mediaPositionPerc = 0;
                };
            },
            function(e) {

                console.log("Error getting pos=" + e);
            }
        );
    }, 1000);

    };

    $scope.goHome = function(){
        $state.go("home");
    };

    $scope.savedPodcasts = function(){
        $state.go("saved");
    };

    /*=====================*/
    /* Download */
    /*=====================*/

    $scope.download = function(download_link, file_name, category) {
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner><br>Downloading to Saved Podcasts'
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
                            var p = fe.toInternalURL();
                            $scope.filePath = p;
                            //console.log("FILE PATH ----------------", p);
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
                                    //console.log("podFILE PATH ----------------", $scope.podFile);
                                    var downloads = JSON.parse( localStorage.getItem("downloads") );
                                    var download_obj = {"download_link": download_link, "file_name": file_name, "category": category, "file_path": $scope.podFile, "podcast": $scope.podcast};
                                    downloads.push(download_obj);
                                    localStorage.setItem("downloads", JSON.stringify(downloads));
                                    $scope.downloads = downloads;

                                    // Update podcasts in scope to reflect that its been downloaded
                                    //for ( var i=0; i<$scope.podcasts.length; i++ ){
                                    //    if ( $scope.podcasts[i]["id"] === $scope.podcast.id  ){
                                            $scope.podcast["downloaded"] = $scope.podFile;
                                    //    }
                                    //};

                                    $scope.$apply();

                                    // track download
                                    try {
                                        api.track_download($scope.podcast.id);
                                    }
                                    catch(err) {
                                        console.log("error: ", err)
                                    };

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

    /*=====================*/
    /* Mailing list modal */
    /*=====================*/
    
    $ionicModal.fromTemplateUrl('templates/join-mailer-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function() {
        $scope.modal.show();
    };
    $scope.closeModal = function() {
        if ( $scope.modal ){
            $scope.modal.hide();
        };
    };
      //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
      // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
      // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

    $scope.openSponsorLink = function(link){
        window.open(link, '_system', 'location=yes'); 
    };

});







/*===========================*/
/* Factories */
/*===========================*/

podradio.factory('api', function( $http ) {

    return {
        get_region_list: function($scope){

            $http.get(global_url+'/api/get_region_list').then(function(resp) {
                //console.log("region list response: ", resp);
                $scope.regions = resp.data;
                //return resp.data;
            }, function(err) {
                $scope_var = null;
                //return null;
            });

        },
        get_school_list: function($scope, region_id){
            $http.get(global_url+'/api/get_school_list/'+region_id).then(function(resp) {
                //console.log("school list response: ", resp.data);
                $scope.schools = resp.data;
                //return resp.data;
            }, function(err) {
                $scope.schools = null;
                //return null
            });
        },
        get_school_podcasts: function($scope, school_id, cursor){

            if ( !cursor ){
                cursor = "";
            };

            $http.get(global_url+'/api/get_school_podcasts/'+school_id+"?cursor="+cursor).then(function(resp) {
                console.log("podcast list response: ", resp.data);
                if ( localStorage.getItem("downloads") ){
                    var podcasts = [];
                    var downloads = JSON.parse( localStorage.getItem("downloads") );
                    for ( var i=0; i<resp.data.podcasts.length; i++ ){
                        resp.data.podcasts[i]["downloaded"] = false;
                        for ( var j=0; j<downloads.length; j++ ){
                            if( resp.data.podcasts[i]["id"] == downloads[j]["podcast"]["id"] ){
                                resp.data.podcasts[i]["downloaded"] = downloads[j]["file_path"];
                            };
                        };
                    };
                };

                $scope.podcasts = resp.data.podcasts;
                $scope.next_curs = resp.data.next_curs;
                console.log("API next_curs: ", $scope.next_curs);
                //$scope.next_curs = true;
                //return resp.data;
            }, function(err) {
                $scope.podcasts = null;
                //return null
            });
        },
        get_all_podcasts: function(){

        },
        get_in_app_message: function($scope){
            $http.get(global_url+'/api/get_message?podcast_id='+$scope.podcast.id).then(function(resp) {
                //console.log("Message resp: ", resp);
                $scope.inAppMessage = resp.data.message;
                $scope.sponsorLink = resp.data.link;
                $scope.sponsorImage = resp.data.image;
                //return resp.data;
            }, function(err) {
                $scope.inAppMessage = null;
                $scope.sponsorLink = false;
                $scope.sponsorImage = false;
                //return null
            });
        },
        track_download: function(podcast_id){
            $http({
                method: 'POST',
                url: global_url+'/api/track_download',
                data: "key=podRadioyo&podcast_id="+podcast_id,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(resp){
                //
            }, function(resp){
                //
            });
        },
        track_play: function(podcast_id){
            //console.log("tracking play..................");
            $http({
                method: 'POST',
                url: global_url+'/api/track_play',
                data: "key=podRadioyo&podcast_id="+podcast_id,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(function(resp){
                //console.log("Tracked play.................");
            }, function(resp){
                //console.log("Failed to track play.................");
            });
        }
    }
});






























/*podradio.controller('AudioCtrl', function( $scope, $cordovaMedia, $ionicLoading ){

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

        if(status == 1) {

        } else {
            $scope.loading = "not loading";
            $ionicLoading.hide();
        };
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
        $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});

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

    $scope.filePath = null;
    $scope.podFile = null;

    $scope.download = function(download_link, file_name, category) {
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner>'
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

                                    // track download
                                    try {
                                        api.track_download();
                                    }
                                    catch(err) {
                                        console.log("error: ", err)
                                    };

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

    $scope.delete = function(file_name) {
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner>'
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
    };


});*/

/*podradio.controller('BrowseCtrl', function( $scope, $ionicLoading, api ){
    $scope.regions = null;
    $scope.schools = null;

    api.get_region_list($scope);

    $scope.school = function(region_id){
        api.get_school_list($scope, region_id);
    };


});*/

