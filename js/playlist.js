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

    $.post('updatedummy.json', {
      uri: track.uri
    }, function(data) {
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
    $('#current-song h2').text(currentTrack.artists[0].name + " - " + currentTrack.name);
    $('#current-song-image').html("<img src='"+currentTrack.image+"' />").find("img").load(function () {
      $('#lovers').html(facebookIcons(current.love)).height($('#current-song-image').height());
      $('#haters').html(facebookIcons(current.hate)).height($('#current-song-image').height());
    });
  }

  playNextSong = function(data, start) {
    if (! start) start = 0;

    current = data.Playlist[start];

    console.log(current);

    models.Track.fromURI(current.href, function(track) {

      currentTrack = track;

      models.player.track = track;
      models.player.playing = true;

      showCurrent();
    });

  }

  updatePlaylist = function() {
    if (removing) return;

    waitingToPlay = true;

		eventGuests( currentEventID );

    $.getJSON("http://partifi.herokuapp.com/playlist/" + currentEventID, playlistLoadComplete);
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
      ret += "<img src='https://graph.facebook.com/"+item+"/picture' /> ";
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
		  $.getJSON(url, function(data) { 
		  	var guests = data.data;
		  	for(var i=0;i<guests.length;i++) {
		  		var guest_name = guests[i].name;
		  		var guest_id = guests[i].id;
		  		
		  		var in_app = true;
		  		
		  		$('#event_guests').append('<img src="https://graph.facebook.com/' + guest_id + '/picture" title="' + guest_name + '"/>');
		  	}
		  })
			
	}
	
  createTop10 = function(data, start) {

    if (! start) start = 0;

    var list = $('#top10 tbody');

    list.empty();

    var ranking = 1;

    $(data.Playlist).each(function(index, item) {
      if (index <= start) return;

      item.love = [0];
      item.hate = [];

      list.append('<tr><td>' + ranking + '<td>' + item.artist + '<br>' + item.name + '</td><td>' + facebookIcons(item.love) + '</td><td>' + facebookIcons(item.hate) + '</td><td>'+facebookIcons([item.love[0]])+'</td></tr>');

      ranking ++;
    });

  }

  startPlaylist = function(eventID) {

    currentEventID = eventID;

    updatePlaylist();
  }

});

