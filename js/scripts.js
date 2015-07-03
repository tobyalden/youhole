var keywordBlacklist = ["pronounc", "say", "vocabulary", "spelling", "mean", "definition", "slideshow", "full", "ebook", "auto-generated by youtube", "amazon.com", "amazon.es", "amazon.co.uk", "bit.ly", "tukunen.org", "bitiiy.com", "http://po.st"];
var viewCountThreshold = 500;
var currentAlgo = 0;

function randomWord() {

  if(currentAlgo === 0) {
    currentAlgo = Math.floor(Math.random() * 7) + 1;
  }

  if(currentAlgo === 1) {
    randomObscureWord();
  } else if(currentAlgo === 2) {
    randomEnglishPhrase();
  } else if(currentAlgo === 3) {
    wikipedia();
  } else if(currentAlgo === 4) {
    nonsenseWord();
  } else if(currentAlgo === 5) {
    nonsenseChinesePhrase();
  } else if(currentAlgo === 6) {
    nonsenseJapanesePhrase();
  } else if(currentAlgo === 7) {
    nonsenseCyrillic();
  } else if(currentAlgo === 8) {
    randomCharacters();
  }
  
}

function nonsenseCyrillic() {
  // U+0400..U+04FF
   var word = getCyrillicChar() + " " + chance.word({syllables: 1});
   console.log("nonsenseCyrillic = " + word);
   randomVideo(word);
}

function randomCharacters() {
  var inputLength = Math.floor(Math.random() * 3) + 3;
  var word = chance.string({length: inputLength, pool: 'abcdefghijklmnopqrstuvwxyz'});
  // var word = chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true}) + chance.character({alpha: true});  
  randomVideo(word);
}

function getCyrillicChar() {
  return String.fromCharCode(0x0400 + Math.random() * (0x04FF-0x0400+1))
}

function getRandomUnicodeCharacter() {
  return String.fromCharCode(0x0000 + Math.random() * (0x0000-0xFFFD+1))
}

// ---------------------------- RANDOM WORD/PHRASE GENERATORS ----------------------------

// 1. Random english word. Often a obscure medical or scientific term.
function randomObscureWord() {
  var requestStr = "http://randomword.setgetgo.com/get.php";
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomObscureWordHelper'
  });
}

function randomObscureWordHelper(data) {
  console.log("using randomword.setgetgo.com");
  var word = data.Word;
  randomVideo(word);
}

// 2. Two common english words separated by a space instead of one.
function randomEnglishPhrase() {
  var requestStr = 'http://api.wordnik.com/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=0&minLength=2&maxLength=4&limit=2&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'randomEnglishPhraseHelper'
  });
}

function randomEnglishPhraseHelper(data) {
  console.log("using api.wordnik.com (two words)");
  var word = data[0].word + " " + data[1].word;
  randomVideo(word);
}

// 3. Uses the MediaWiki API to get a random article title from different language wikipedias.
function wikipedia() {
  var a = Math.floor(Math.random() * 3) + 1;
  if(a === 1) {
    englishWikipedia();
  } else if(a === 2) {
    spanishWikipedia();
  } else if(a === 3) {
    dutchWikipedia();
  }
}

function englishWikipedia() {

  var requestStr = 'https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'englishWikipediaHelper'
  });
}

function englishWikipediaHelper(data) {
  console.log("using en.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

function spanishWikipedia() {

  var requestStr = 'https://es.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'spanishWikipediaHelper'
  });
}

function spanishWikipediaHelper(data) {
  console.log("using es.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

function dutchWikipedia() {

  var requestStr = 'https://de.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exchars=500&format=json';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      jsonpCallback: 'dutchWikipediaHelper'
  });
}

function dutchWikipediaHelper(data) {
  console.log("using de.wikipedia.org");
  var dataId = Object.keys(data.query.pages)[0];
  var word = data.query.pages[dataId.toString()].title;
  randomVideo(word);
}

// 4. A "truly random" nonsense phrase, i.e. "behuga"
function nonsenseWord() {
  var word = chance.word({syllables: 2});
  randomVideo(word);
}

// 5. Two random chinese characters with a space between them
function nonsenseChinesePhrase() {
  // U0530 - U18B0 all unicode (lots of trains for some reason)
  // var word = getRandomKatakana() + " " + getRandomKatakana() + " " + getRandomKatakana();
  var word = getRandomChineseCharacter() + " " + getRandomChineseCharacter();
  console.log("using nonsense Chinese phrase: " + word);
  randomVideo(encodeURIComponent(word));
}

function getRandomChineseCharacter() {
  return String.fromCharCode(0x4E00 + Math.random() * (0x62FF-0x4E00+1));
}

// 6. Two random chinese characters with a space between them
function nonsenseJapanesePhrase() {
    var word = getRandomJapaneseCharacter() + getRandomJapaneseCharacter();
    console.log("using nonsense Japanese phrase: " + word);
    randomVideo(encodeURIComponent(word));
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

// 7. Korean Hangul
// function nonsenseKoreanPhrase() {
//   var word = getRandomHangul() + getRandomHangul() + " " + getRandomHangul() + getRandomHangul();
//     console.log("using nonsense Korean phrase: " + word);
//     randomVideo(encodeURIComponent(word));
// }

// function getRandomHangul() {
//   // 0600 06FF arabic
//   return String.fromCharCode(0x0600 + Math.random() * (0x06FF-0x0600+1));
// }


// ---------------------------- YOUTUBE QUERY & VIDEO QUALIFICATIONS  ----------------------------

function randomVideo(word) {
  console.log("making ajax request with: " + word);
  var requestStr = 'https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=' + word + '&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60';
  $.ajax({
      type: "GET",
      url: requestStr,
      dataType: "jsonp",
      contentType: "application/json; charset=utf-8",
      jsonpCallback: 'randomVideoAjaxHelper'
  });
}

function randomVideoAjaxHelper(responseJSON) {
  if (responseJSON.items.length < 1) {
    console.log("No videos found for search term. Restarting search.");
    randomWord();
  } else {
    var videoChoice = Math.floor(Math.random() * responseJSON.items.length);
    console.log("choosing video #" + videoChoice + " of " + responseJSON.items.length);
    var videoId = responseJSON.items[videoChoice].id.videoId;
    var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
    $.getJSON(url2).then(function(responseJSON2) {
      if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
        console.log("View count too high. Restarting search.");
        randomWord();
      } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
        console.log("Title: " + responseJSON2.items[0].snippet.title + " - Description: " + responseJSON2.items[0].snippet.description + " contains blacklisted word. Restarting search.")
        randomWord();
      } else {
        console.log("Success! Video ID = " + responseJSON2.items[0].id);
        currentAlgo = 0;
        player.loadVideoById(responseJSON2.items[0].id);
      }
    });
  }
}

// function randomVideoJSON(word) {
//   // debugger;
//   console.log(word);
//   var url = "https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&q=" + word + "&type=video&maxResults=50&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
//   $.getJSON(url).then(function(responseJSON) {
//     // debugger;
//     if (responseJSON.items.length < 1) {
//       console.log("No videos found for " + word + ". Restarting search.");
//       randomWord();
//     } else {
//         var videoId = responseJSON.items[0].id.videoId;
//         var url2 = "https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+statistics&id=" + videoId + "&key=AIzaSyAHu80T94GGhKOzjBs9z5yr0KU8v48Zh60";
//         $.getJSON(url2).then(function(responseJSON2) {
//           if(responseJSON2.items[0].statistics.viewCount > viewCountThreshold) {
//             console.log("View count too high. Restarting search.");
//             randomWord();
//           } else if(isBlacklisted(responseJSON2.items[0].snippet.title, responseJSON2.items[0].snippet.description)) {
//             console.log("Title: " + responseJSON2.items[0].snippet.title + " - Description: " + responseJSON2.items[0].snippet.description + " contains blacklisted word. Restarting search.")
//             randomWord();
//           } else {
//             console.log("Success! Video ID = " + responseJSON2.items[0].id);
//             player.loadVideoById(responseJSON2.items[0].id);
//           }
//         });
//       }
//   });
// }

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

// ---------------------------- YOUTUBE API BULLSHIT ----------------------------

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    playerVars: {
      'showinfo': 0, 
      'controls': 0,
      'rel': 0,
      'showinfo': 0
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onError
    }
  });
}

function onError(event) {
  console.log("Error encountered. Retrying.");
  randomWord();
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {

    randomWord();

    $("#next").click(function(event) {
      event.preventDefault();
      $('#nextImg').addClass('animated bounceOutDown');
      console.log("randomVideo clicked");
      randomWord();
    });


    // });



    function getIdFromUrl(url) {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      var match = url.match(regExp);
      if (match && match[2].length == 11) {
        return match[2];
      } else {
        console.log("Error: Invalid URL");
      }
    }

    // i.e. PT10M PT1M47S PT1H1S
    function parseDuration(duration) {
      var returnStr = "";

      var numberRegex = /(\d+)/g;
      var numericArray = duration.match(numberRegex);

      var letterRegex = /[a-zA-Z]+/g;
      var letterArray = duration.match(letterRegex);
      letterArray.shift();

      var durationUnits = {
        "S": " sec ",
        "M": " min ",
        "H": " hour "
      };

      for(var i = 0; i < numericArray.length; i++) {
        returnStr += numericArray[i] + durationUnits[letterArray[i]];
      }
      return returnStr;
    }
}

//         


// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    randomWord();
  } else if(event.data == YT.PlayerState.PLAYING) {
    $('#nextImg').removeClass('animated bounceOutDown');
  }
}

$(document).on("keydown", function (e) {
  if(e.keyCode === 32 || e.keyCode === 40) {
    $('#nextImg').addClass('animated bounceOutDown');
    randomWord();
  }
});
