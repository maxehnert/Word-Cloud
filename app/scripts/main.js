"use strict";

// Create our canvas container
//var canvas = document.getElementById("canvas-container");
//var context = canvas.getContext("2d");
var canvasContainer = document.getElementById("canvas-container");
var contextContainer = canvasContainer.getContext("2d");

let wordCloud = string => {

  let sortedWords = [];
  let wordObject = {};
  let word;
  /* Should think about using new Map() instead of using an object and then later creating the same key,value array. It could elminate a loop and rduce O space and time*/

  // Loop through our array of words
  // Separate the string into individual words which also makes it an array
  for ( word of string.split(' ') ) {

    // For now lets set all words to lower case
  	word = word.toLowerCase();

    // If it's a new word, add it to our object
    if( !wordObject[word] ) {
      wordObject[word] = 1;
    }
    // If it's Not a new word, just increment it
    else {
    	wordObject[word] += 1;
    }
  }

  // Loop through our word object so you can put them into an array
  for( word in wordObject ) {
    // Setup some regex to stop any punctuation, numbers, or weird characters from getting through
    let validLetters = /[a-z]/;

    // Push each key,value into an array of arrays
    if( validLetters.test(word) ) {
    	sortedWords.push( [word, wordObject[word]] );
    }
  }
  // Use the built in sorting method to sort by value
  // Only keep the last 10 elements (they have the largest count)
  sortedWords = sortedWords.sort( (a, b) => a[1] - b[1] )
                           .slice(-10);
  return sortedWords;
};

let doSomethingWithTheArray = string => {

  // Map over the array
  let logMap = (value, map) => {


    var word = value[0];



    /* set a font size based on it's position in the array.
     * The most frequent word will be the largest.
     * map count is incremental 0-9.
     * 0 is the lowest count word
     */
    if (map == 0) {
      var fontSize = map + 0.5 * 16;
    } else var fontSize = map * 16;
    //  console.log(map);

    console.log(value);

    // // this set random color for the word
    // context.fillStyle = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
    //
    // // creating the font characteristics
    // // size noted above
    // context.font = `bold ${fontSize}em Arial`;
    //
    // let wordPositionFromTop = Math.random() * 200 + 100;
    // let wordPositionFromLeft = Math.random() * 200 + 100;
    //
    // //context.fillText( word, Math.random() * 200 + 100 , Math.random() * 200 + 100 );
    // context.fillText( word, wordPositionFromTop , wordPositionFromLeft );
    //
    //
    // // tells you the width of the element
    // var metrics = context.measureText(word);
    // console.log(metrics);


    /*
     * Testing crerating multiple canvas els for each word
    */

    var canvas = document.createElement('canvas');
    canvas.className = "temp-word-canvas";
    canvas.id = word;
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    //canvas.style.border = "1px solid";
    //canvas.style.display = "none";

    var bodyTest = document.getElementsByTagName("body")[0];
    bodyTest.appendChild(canvas);
    var canvas = document.getElementById(word);
    var context = canvas.getContext("2d");
    context.font = `bold ${fontSize}px Arial`;
    //console.log(context.measureText(word).width);
    canvas.width = context.measureText(word).width;

    //TODO: This work for right now for getting the whole word in the element, but better to add a checker /A-Z/ and f,g,j,p and add height and offset based on a needed param.
    canvas.height = fontSize + 5;
    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
    context.textBaseline = "hanging";
    context.fillText( word, 0, 5);

    // When all the words are placed into canvas el then push them into the main canvas
    //TODO: make this better by using the wordCloud array instead of hard coded length
    if(document.getElementsByClassName("temp-word-canvas").length == 10) {
      pushWordCanvasToMain();
    };
  };

  wordCloud(string).forEach(logMap);
};

let pushWordCanvasToMain = () => {

  let wordCanvasArray = document.getElementsByClassName('temp-word-canvas');

  // for..of not working here with error message:
  // TypeError: wordCanvasArray[Symbol.iterator] is not a function
  //
  // So we're doing the old way with a for loop
  for (var i = 0; i < wordCanvasArray.length; i++) {
      console.log(wordCanvasArray[i]);
      contextContainer.drawImage(wordCanvasArray[i], 10, 10);
  };
}

$('.sumbit-btn-js').click( () => {

  // Clear out the canvas element before adding anything else to it.
  //context.clearRect(0, 0, canvas.width, canvas.height)

  doSomethingWithTheArray($('.text-input-js').val());

});
