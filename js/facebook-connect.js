function get_facebook_events( accesstoken ){
  // locally saved access token
  var accessToken = localStorage.getObject("fb_accessToken");

  // url to request
  var request_url = 'https://graph.facebook.com/me/events/';

  var url = request_url + '?since='+ strtotime( 'now' ) +'&until='+ strtotime( '+ 1 year' ) +'&access_token=' + accessToken + '';
  $.getJSON(url, function(data) {
    $('#events').css('display','block');
    $("#index").addClass("events");

    var events = data.data;
    console.log(events);
    events.reverse();
    for(var i=0;i<events.length;i++) {
      /* console.log(events[i].name); */
      var event_name = events[i].name;
      var event_location = events[i].location;
      var event_date = events[i].start_time;
      var event_id = events[i].id;
      $('#events ul').append('<li data-id='+event_id+'>' +
                             '<span class="name">' + event_name + '</span>' +
                             '<span class="location">'+ event_location + '</span>' +
                             '<span class="date">'+ $.timeago(event_date) + '</span></li>');
    }

    $('#events ul li').click(function(){
      console.log($(this).attr('data-id'));
      localStorage.setObject("fb_event", $(this).attr('data-id'));

    document.location.href = "sp://partifi/tabs/home.html";
    })
  })

}

function get_facebook_user( ){
  $('#fb-login').css('display','none');

  // locally saved access token
  var accessToken = localStorage.getObject("fb_accessToken");
  // url to request
  var request_url = 'https://graph.facebook.com/me';

  var url = request_url + '?access_token=' + accessToken + '';
  $.getJSON(url, function(data) {
    var user = data;
    $('#user_photo').html('<img src="https://graph.facebook.com/'+user.id+'/picture" />');
    $('#user_info').html(''+ user.name +'<br><a href="#" id="fb-logout">log me out</a>');
  })
}

$(document).ready(function() {
    //timeago
    jQuery.timeago.settings.allowFuture = true;
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
                localStorage.setObject("fb_accessToken", accessToken);
                $("#topbar").addClass("active");
                get_facebook_events();
                get_facebook_user();
            },
            onFailure: function(error) {
                console.log("Authentication failed with error: " + error);
            },
            onComplete: function() {


            }
        });
    });
    }else{
      console.log("get stuff");
      $("#topbar").addClass("active");
      get_facebook_events();
      get_facebook_user();
    }

    $('#fb-logout').live('click', function(){
      console.log("foo");
      localStorage.removeObject("fb_accessToken")
      document.location.href = "sp://partifi/index.html";
    })
});

