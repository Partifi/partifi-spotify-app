function get_facebook_events( accesstoken ){
	// locally saved access token
	var accessToken = localStorage.getObject("fb_accessToken");

	// url to request
	var request_url = 'https://graph.facebook.com/me/events/';
	
	var url = request_url + '?since='+ strtotime( 'now' ) +'&until='+ strtotime( '+ 1 year' ) +'&access_token=' + accessToken + '';
  $.getJSON(url, function(data) {
  	$('#events').css('display','block');
  	$('#fb-login').remove();  	
  	$('#status').text('Logged in as');
  	$('#status_msg').remove();
  	
  	var events = data.data
  	events.reverse();
  	for(var i=0;i<events.length;i++) {
  		/* console.log(events[i].name); */
      var event_name = events[i].name;
      var event_location = events[i].location;
      var event_date = events[i].start_time.replace('T',' ');
      var event_id = events[i].id;
      $('#events table tbody').append('<tr data-id='+event_id+'><td>'+event_date+'</td><td>' + event_name + '</td><td>'+ event_location +'</td></li>');
    }
  })
  
}

function get_facebook_user( ){
	// locally saved access token
	var accessToken = localStorage.getObject("fb_accessToken");
	
	// url to request
	var request_url = 'https://graph.facebook.com/me';
	
	var url = request_url + '?access_token=' + accessToken + '';
  $.getJSON(url, function(data) {
  	var user = data
  	
  	$('#user_photo').html('<img src="https://graph.facebook.com/'+user.id+'/picture" />');
  	$('#user_info').html('<h1>'+ user.name +'</h1>');
  
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
                get_facebook_events( )
                get_facebook_user( )
            },
            onFailure: function(error) {
                console.log("Authentication failed with error: " + error);
            },
            onComplete: function() { }
        });
    });
    }else{
    	get_facebook_events(  )
    	get_facebook_user( )
    }
});