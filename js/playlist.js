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
	
//	$('#sad').play();
	
	models.player.observe(models.EVENT.CHANGE, function(event) {
		
		if (! models.player.playing) {
			
			if (waitingToPlay) return;
			if (! models.player.track) {
				updatePlaylist();
				removeTrack(current);
			}
		} else {
			waitingToPlay = false;
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
		
		console.log(data.Playlist[0].uri);
		
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
		$('#current-song-image').html("<img src='"+currentTrack.image+"' />");
		$('#lovers').html(facebookIcons(current.love));
		$('#haters').html(facebookIcons(current.hate));
	}
	
	playNextSong = function(data, start) {
		if (! start) start = 0;
	
		current = data.Playlist[start];
		
		console.log(current);
		
		models.Track.fromURI(current.uri, function(track) {
			currentTrack = track;
		
			models.player.track = track;
			models.player.playing = true;
		});
				
	}
	
	updatePlaylist = function() {		
		if (removing) return;
				
		waitingToPlay = true;	
			
		$.getJSON("http://parti.fi:9292/playlist/" + currentEventID, playlistLoadComplete);
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
	
	createTop10 = function(data, start) {
			
		if (! start) start = 0;
			
		var list = $('#top10 tbody');
		
		list.empty();
		
		var ranking = 1;
										
		$(data.Playlist).each(function(index, item) {
			if (index <= start) return;
					
			var track = models.Track.fromURI(item.uri);
						
			list.append('<tr><td>' + ranking + '<td>' + track.name + '</td><td>' + mergeArtists(track) + '</td><td>' + facebookIcons(item.love) + '</td><td>' + facebookIcons(item.hate) + '</td><td>'+facebookIcons([item.love[0]])+'</td></tr>');
			
			ranking ++;
		});
		
	}
	
	startPlaylist = function(eventID) {
		
		currentEventID = eventID;
		
		updatePlaylist();
	}
	
});