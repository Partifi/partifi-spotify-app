$(function() {
  var current;

  var currentTrack;

  var currentEventID;

    sp = getSpotifyApi(1);
    var models = sp.require('sp://import/scripts/api/models');
  var views = sp.require("sp://import/scripts/api/views");

  var waitingToPlay = false;

  var timeout;

  var pollingInterval = 5000;

  var removing = false;

  models.player.observe(models.EVENT.CHANGE, function(event) {

    if (! models.player.playing) {

      if (waitingToPlay) return;
      if (! models.player.track) {
        updatePlaylist();
        removeTrack(current);
      } else {
        clearTimeout(timeout);
        timeout = null;
      }
    } else {
      waitingToPlay = false;

      if (! timeout) {
        timeout = setTimeout(updatePlaylist, pollingInterval);
      }

    }
  });

  removeTrack = function(track) {
    removing = true;

    $.post('http:///partifi.herokuapp.com/playlist/'+ currentEventID + '/' + track.href, {}, function(data) {
      removing = false;

      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(updatePlaylist, pollingInterval);

    });
  }

  playlistLoadComplete = function(data) {

    /* console.log(data.Playlist[0].uri); */

    if (models.player.playing && current && current.uri != data.Playlist[0].uri) {
      current = null;
    }

    if (! models.player.playing || ! current) {

      var start = 0;

      if (current && data.Playlist[0].uri == current.uri) start = 1;

      playNextSong(data, start);
    } else {
      current = data.Playlist[0];
    }

    if (currentTrack) showCurrent();

    createTop10(data, start);

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(updatePlaylist, pollingInterval);
  }

  showCurrent = function() {
    $('#current-song h2').html(currentTrack.artists[0].name + " - " + currentTrack.name);
    $('#current-song-image').html("<img src='"+currentTrack.image+"' />").find("img").load(function () {
      $('#lovers').html(facebookIcons(current.lovers)).height($('#current-song-image').height());
      $('#haters').html(facebookIcons(current.haters)).height($('#current-song-image').height());
    });
  }

  playNextSong = function(data, start) {
    if (! start) start = 0;

    current = data.Playlist[start];

    console.log(current);

    models.Track.fromURI(current.href, function(track) {
			
      currentTrack = track;
      
			/* if(track.availableForPlayback==true){ */
	      models.player.track = track;
	      models.player.playing = true;
      /*
}else{
      	models.player.track = track;
      	
	      removeTrack( current );
	      updatePlaylist();
      }
*/

      showCurrent();
    });

  }

  updatePlaylist = function() {
    if (removing) return;

    waitingToPlay = true;

	eventGuests( currentEventID );
		var timestamp = new Date().getTime();
    $.getJSON("http://partifi.herokuapp.com/playlist/" + currentEventID + '?t=' + timestamp, playlistLoadComplete);
  }

  mergeArtists = function(track) {
    var ret = "";

    $(track.artists).each(function(index, item) {
      if (index > 0) ret += ", ";

      ret += item.name;
    });

    return ret;
  }

  facebookIcons = function(arr) {
    ret = "";

    $(arr).each(function(index, item) {
    	if(item){
      ret += "<img src='https://graph.facebook.com/"+item+"/picture' /> ";
      }
    });

    return ret;
  }

	eventGuests = function( event_id ) {

			// locally saved access token
		  var accessToken = localStorage.getObject("fb_accessToken");

		  // url to request
		  var request_url = 'https://graph.facebook.com/' + event_id + '/attending';

		  var url = request_url + '?access_token=' + accessToken + '';
		  $('#event_guests').html('');
		  
		  var timestamp = new Date().getTime();
		  $.getJSON("http://partifi.herokuapp.com/attendees/" + currentEventID + '?v=' + timestamp, function( attendees ){
		  
		  $.getJSON(url, function(data) {
		  	var guests = data.data;
		  	for(var i=0;i<guests.length;i++) {
		  		var guest_name = guests[i].name;
		  		var guest_id = guests[i].id;

					if(inArray(guest_id, attendees)===true){
		  		var in_app = 'active';
		  		}else{
		  		var in_app = '';
		  		}

		  		$('#event_guests').append('<img class="' + in_app + '" src="https://graph.facebook.com/' + guest_id + '/picture" title="' + guest_name + '"/>');
		  	}
		  })
		  
		  })

	}

  createTop10 = function(data, start) {

    if (! start) start = 0;

    var list = $('#top10 tbody');

    list.empty();

    var ranking = 1;

    $(data.Playlist).each(function(index, item) {
      if (index <= start) return;

      list.append('<tr><td>' + ranking + '<td>' + item.artist + '<br>' + item.name + '</td><td><span class="heart">' + item.lovers.length + '</span></td><td><span class="hate">' + item.haters.length + '</span></td><td>'+facebookIcons([item.lovers[0]])+'</td></tr>');

      ranking ++;
    });

  }

  startPlaylist = function(eventID) {

    currentEventID = eventID;

    updatePlaylist();
  }

});

