function get_events( accesstoken ){
	console.log('events');
	// url to request
	var request_url = 'https://graph.facebook.com/me/events/';
	
	var url = request_url + '?access_token=' + accesstoken;
  $.getJSON(url, function(data) {
  	console.log(data);
  })
  
}

$(document).ready(function() {
    /* Instantiate the global sp object; include models */
    var sp = getSpotifyApi(1);
    var auth = sp.require('sp://import/scripts/api/auth');

    /* Set the permissions you want from the user */
    var permissions = ['user_about_me','user_events'];
    var app_id = '253709418060474';


		if(!localStorage.getObject("fb_accessToken"))
		{
    $('#fb-login').click(function(){
        auth.authenticateWithFacebook(app_id, permissions, {
            onSuccess: function(accessToken, ttl) {
                localStorage.setObject("fb_accessToken", accessToken)
                get_events( accessToken )
            },
            onFailure: function(error) {
                console.log("Authentication failed with error: " + error);
            },
            onComplete: function() { }
        });
    });
    }else{
    	$('#status, #fb-login').remove();
    	
    	var accessToken = localStorage.getObject("fb_accessToken");
    	get_events( accessToken )
    }
});