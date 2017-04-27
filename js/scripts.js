// ---------------------------- FIREBASE I/O ----------------------------

var db = new Firebase("https://youhole.firebaseio.com/prevWatched");

// ---------------------------- LOADING THE YOUTUBE API AND CREATING THE PLAYER ----------------------------

// Videos containing blacklisted words in their title or desciption won't be played.
var keywordBlacklist = ["pronounc", "say", "vocabulary", "spelling", "mean", "definition", "slideshow", "full", "ebook", "auto-generated by youtube", "amazon.com", "amazon.es", "amazon.co.uk", "bit.ly", "tukunen.org", "bitiiy.com", "http://po.st"];

// Videos with a higher view count than the threshold won't be played.
var viewCountThreshold = 500;

// This array is populated with ~1000 words by an AJAX call to api.wordnik.com at startup
var randomWords = [];
var isPopulating = false;

var acceptingInput = false;
var mobileStartFlag = false;



// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player) after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    playerVars: {
      'enablejsapi': 1,
      'autoplay': 1,
      'autohide': 2,
      'controls': 0,
      'disablekb': 0,
      'rel': 0,
      'showinfo': 0,
      'modestbranding': 0,
      'title': 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onError
    }
  });
}

function onError(event) {
  nextVideo();
}


// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    mobileStartFlag = true;
    nextVideo();
}

// The API calls this function when the player's state changes.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    acceptingInput = false;
    toggleStatic();
    nextVideo();
  }

  if(event.data == YT.PlayerState.PLAYING) {
    acceptingInput = true;
    player.unMute()
    toggleStatic();
  }
}

// Loads and starts playing static SFX
soundManager.onready(function() {
    var s = soundManager.createSound({
        id: 'staticAudio',
        url: './public/static.mp3'
    });
    loopSound(s);
    function loopSound(sound) {
      sound.play({
        onfinish: function() {
          loopSound(sound);
        }
      });
    }
});

// function enableStatic() {
//   $('#static').addClass('static-on');
//   $('#static').removeClass('static-off');
//
// }
function toggleStatic() {
  $('#static').toggleClass('static-on');
  $('#static').toggleClass('static-off');
  $('#censor-image').toggleClass('static-on');
  $('#censor-image').toggleClass('static-off');
  soundManager.toggleMute('staticAudio');
}

// ---------------------------- FINDING & PLAYING VIDEOS ----------------------------



$(document).on("keydown", function (e) {
  if(acceptingInput) {
    if(e.keyCode === 32 || e.keyCode === 40) {
      goDeeper();
    }
  }
});

$(document).on("touchend", function (e) {
  if (acceptingInput) {
      goDeeper();

  } else if (mobileStartFlag) {
    nextVideo();
    }
});

$(document).click(function(e) {
  if(acceptingInput) {
    if (e.button == 0 ) {
      goDeeper();
    }
  }
});

function goDeeper() {
  nextVideo();
  toggleStatic();
  player.mute()
  acceptingInput = false;
}

// Go to the next video. Called when the current video finishes or the user hits next.
function nextVideo() {
  var nextVideoId = sessionStorage.getItem('nextVideoId');
  if(nextVideoId === null) {
    findAndPlayVideo();
  } else {
    playVideo(nextVideoId);
    sessionStorage.removeItem('nextVideoId')
    findAndStoreVideo();
  }
}

// Immediately play the video with the given id.
function playVideo(id) {
  player.loadVideoById(id);
  addToPrevWatched(id);
}

// Returns a randomly generated "seed" to use as a search term.
function getSearchSeed() {
  if(randomWords.length === 0 && !isPopulating) {
    populateRandomWords();
  }

  algo = Math.floor(Math.random() * 9) + 1;
  if(algo === 1) {
    return nonsenseWord();
  } else if(algo === 2) {
    return nonsenseChinesePhrase();
  } else if(algo === 3) {
    return nonsenseJapanesePhrase();
  } else if(algo === 4) {
    return nonsenseCyrillic();
  } else if(algo === 5) {
    return randomCharacters();
  } else if(algo === 6) {
    return nonsenseHangul();
  } else if(algo === 7) {
    return nonsenseArabic();
  } else if(algo === 8) {
    return nonsenseLatin();
  } else if (algo === 9) {
    if(randomWords.length === 0) {
      return nonsenseLatin();
    } else {
      var word = randomWords.pop();
      return word;
    }
  }
}

// Finds and immediately plays a video, then calls findAndStoreVideo().
function findAndPlayVideo() {
  var word = getSearchSeed();
  var requestStr = 'https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=' + word + '&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      contentType: "application/json; charset=utf-8",
      jsonpCallback: 'findAndPlayVideoHelper'
  });
}

function findAndPlayVideoHelper(responseJSON) {
  if (responseJSON.items.length < 1) {
    findAndPlayVideo();
  } else {
    var videoChoice = Math.floor(Math.random() * responseJSON.items.length);
    var videoId = responseJSON.items[videoChoice].id.videoId;
    var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
    $.getJSON(url2).then(function(responseJSON2) {
      if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
        findAndPlayVideo();
      } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
        findAndPlayVideo();
      } else {
        // if it was previously watched, findAndPlayVideo()
        // otherwise do the shit below
        checkIfPrevWatched(responseJSON2.items[0].id, true);
      }
    });
  }
}

function checkIfPrevWatched(videoId, isPlayingImmediately) {
  db.child(videoId).once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
    prevWatchedCallback(videoId, exists, isPlayingImmediately);
  });
}

function prevWatchedCallback(videoId, exists, isPlayingImmediately) {
  if (isPlayingImmediately) {
    if (exists) {
      console.log("[PLAY] Previously watched. Skipping.");
      findAndPlayVideo();
    } else {
      console.log("[PLAY] Never been watched. Adding to prevWatched.");
      player.loadVideoById(videoId);
      addToPrevWatched(videoId);
      findAndStoreVideo();
    }
  } else {
    if (exists) {
      console.log("[STORE] Previously watched. Skipping.");
      findAndStoreVideo();
    } else {
      console.log("[STORE] Never been watched. Adding to prevWatched.");
      sessionStorage.setItem('nextVideoId', videoId);
      addToPrevWatched(videoId);
    }
  }
}

function addToPrevWatched(videoId) {
  db.push({
    id: videoId
  });
}

// Finds a video and stores its id in sessionStorage.
function findAndStoreVideo() {
  var word = getSearchSeed();
  var requestStr = 'https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=' + word + '&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      contentType: "application/json; charset=utf-8",
      jsonpCallback: 'findAndStoreVideoHelper'
  });
}

function findAndStoreVideoHelper(responseJSON) {
  if (responseJSON.items.length < 1) {
    findAndStoreVideo();
  } else {
    var videoChoice = Math.floor(Math.random() * responseJSON.items.length);
    var videoId = responseJSON.items[videoChoice].id.videoId;
    var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
    $.getJSON(url2).then(function(responseJSON2) {
      if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
        findAndStoreVideo();
      } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
        findAndStoreVideo();
      } else {
        checkIfPrevWatched(responseJSON2.items[0].id, false);
      }
    });
  }
}

function isBlacklisted(title, description) {
  title = title.toLowerCase();
  description = description.toLowerCase();
  for(var i = 0; i < keywordBlacklist.length; i++) {
    if(title.includes(keywordBlacklist[i]) || description.includes(keywordBlacklist[i])) {
      return true;
    }
  }
  return false;
}

// ---------------------------- SEED GENERATORS ----------------------------

// A "truly random" nonsense phrase, i.e. "behuga".
function nonsenseWord() {
  var word = chance.word({syllables: 3});
  return word;
}

// Two random chinese characters with a space between them.
function nonsenseChinesePhrase() {
  // U0530 - U18B0 all unicode (lots of trains for some reason)
  // var word = getRandomKatakana() + " " + getRandomKatakana() + " " + getRandomKatakana();
  var word = getRandomChineseCharacter() + " " + getRandomChineseCharacter();
  word = encodeURIComponent(word);
  return word;
}

function getRandomChineseCharacter() {
  return String.fromCharCode(0x4E00 + Math.random() * (0x62FF-0x4E00+1));
}

// Two random japanese characters with a space between them.
function nonsenseJapanesePhrase() {
    var word = getRandomJapaneseCharacter() + getRandomJapaneseCharacter();
    word = encodeURIComponent(word);
    return word;
}

function getRandomJapaneseCharacter() {
  var a = Math.floor(Math.random() * 3) + 1;
  if(a === 1) {
    return String.fromCharCode(0x4E00 + Math.random() * (0x62FF-0x4E00+1));
  } else if(a === 2) {
    return String.fromCharCode(0x3040 + Math.random() * (0x309F-0x3040+1));
  } else {
    return String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0x30A0+1));
  }
}

function getRandomHiragana() {
  return String.fromCharCode(0x3040 + Math.random() * (0x309F-0x3040+1));
}

function getRandomKatakana() {
  return String.fromCharCode(0x30A0 + Math.random() * (0x30FF-0x30A0+1));
}

function nonsenseCyrillic() {
   var word = getCyrillicChar() + " " + chance.word({syllables: 1});
   word = encodeURIComponent(word);
   return word;
}

function randomCharacters() {
  var inputLength = Math.floor(Math.random() * 3) + 3;
  var word = chance.string({length: inputLength, pool: 'abcdefghijklmnopqrstuvwxyz'});
  // var word = chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true});
  return word;
}

function nonsenseHangul() {
  var word = getRandomHangul() + " " + getRandomHangul();
  word = encodeURIComponent(word);
  return word;
}

function nonsenseArabic() {
  var word = getRandomArabic() + getRandomArabic() + getRandomArabic();
  word = encodeURIComponent(word);
  return word;
}

function nonsenseLatin() {
  var word = getLatinChar() + chance.string({length: 1, pool: 'abcdefghijklmnopqrstuvwxyz'}) + getLatinChar();
  word = encodeURIComponent(word);
  return word;
}

function getLatinChar() {
  return String.fromCharCode(0x00C0 + Math.random() * (0x00C0-0x00FF+1))
}

function getCyrillicChar() {
  return String.fromCharCode(0x0400 + Math.random() * (0x04FF-0x0400+1))
}

function getRandomUnicodeCharacter() {
  return String.fromCharCode(0x0000 + Math.random() * (0x0000-0xFFFD+1))
}

function getRandomHangul() {
  return String.fromCharCode(0xAC00 + Math.random() * (0xAC00-0xD7AF+1))
}

function getRandomEthiopic() {
  return String.fromCharCode(0x1200 + Math.random() * (0x1200-0x137F+1))
}

function getRandomArabic() {
  return String.fromCharCode(0x0600 + Math.random() * (0x0600-0x06FF+1))
}

function populateRandomWords() {
  isPopulating = true;
  var requestStr = 'http://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=0&minLength=3&maxLength=10&limit=1000&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'populateRandomWordsHelper'
  });
}

function populateRandomWordsHelper(data) {
  var newRandomWords = '';
  for(var i = 0; i < data.length; i++) {
    newRandomWords += data[i].word;
    if(i < data.length - 1) {
      newRandomWords += "~";
    }
  }
  randomWords = newRandomWords.split('~');
  randomWords = shuffle(randomWords);
  isPopulating = false;
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
