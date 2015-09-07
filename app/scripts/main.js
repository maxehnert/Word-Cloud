'use strict';

// Setup our main canvas container.
var canvasContainer = document.getElementById("canvas-container");
var contextContainer = canvasContainer.getContext("2d");
var count = 0;
var countv = 0;
/*
 * Main function for parsing the block of text and pulling out the 10 most used words.
*/
let wordCloud = string => {

  let sortedWords = [];
  let wordObject = {};
  let word;

  /*NOTE: Should think about using new Map() instead of using an object and then later creating the same key,value array. It could elminate a loop and rduce O space and time*/

  /*
   * Loop through our array of words.
   * Separate the string into individual words which also makes it an array.
  */
  for ( word of string.split(' ') ) {

    // For now lets set all words to lower case.
  	word = word.toLowerCase();

    // If it's a new word, add it to our object.
    if( !wordObject[word] ) {
      wordObject[word] = 1;
    }
    // If it's Not a new word, just increment it.
    else {
    	wordObject[word] += 1;
    };
  };

  // Loop through our word object so you can put them into an array.
  for( word in wordObject ) {
    // Setup some regex to stop any punctuation, numbers, or weird characters from getting through.
    let validLetters = /[a-z]/;

    // Push each key,value into an array of arrays
    if( validLetters.test(word) ) {
    	sortedWords.push( [word, wordObject[word]] );
    };
  };

  /*
   * Use the built in sorting method to sort by value.
   * Only keep the last 10 elements (they have the largest count).
  */
  sortedWords = sortedWords.sort( (a, b) => a[1] - b[1] )
                           .slice(-10);
  return sortedWords;
};

/*
 * Use the array of [[word, count],..] to construct individual canvas elements for each word.
 * Add styling to the words also.
*/
let wordInputArray = string => {

  // Map over the array
  let logMap = (value, map) => {

    let word = value[0];

    /* Set a font size based on it's position in the array.
     * The most frequent word will be the largest.
     * map count is incremental 0-9.
     * 0 is the lowest count word
     */
     let fontSize = ((Math.log(map+1)*20) + 14);

    /*
     * Dynamically create Canvas elements for each word.
    */
    var canvas = document.createElement('canvas');
    canvas.className = "temp-word-canvas";
    canvas.id = word;
    canvas.style.zIndex = 8;
    //canvas.style.position = "absolute";
    //canvas.style.display = "none";

    var bodyTest = document.getElementsByTagName("body")[0];
    bodyTest.appendChild(canvas);
    var canvas = document.getElementById(word);
    var context = canvas.getContext("2d");
    context.font = `bold ${fontSize}px Arial`;

    if(map % 2 == 0){

     canvas.height = context.measureText(word).width;
     canvas.width = fontSize + 5;
     context.textBaseline = "hanging";
        var tx = (context.measureText(word).width/2);
        var ty = 5;
        // Translate to near the center to rotate about the center
        context.translate(tx,ty);
        // Then rotate...
        context.rotate(Math.PI / 2);
        // Then translate back to draw in the right place!
        context.translate(-tx,-ty);
      } else{

    canvas.width = context.measureText(word).width;

    //TODO: This works for right now for getting the whole word in the element, but better to add a checker /A-Z/ and f,g,j,p and add height and offset based on a needed param.
    canvas.height = fontSize + 5;
    context.textBaseline = "hanging";
  }
    // Size noted above
    context.font = `bold ${fontSize}px Arial`;
    // This sets a random color for the word.
    context.fillStyle = "hsl(" + Math.random() * 360 + ", 100%, 50%)";

    context.fillText( word, 0, 5);


  };

  wordCloud(string).forEach(logMap);

  // Make sure this only runs when we have all the words in their own canvas el.
  if( document.getElementsByClassName("temp-word-canvas").length == wordCloud(string).length ) {
    //pushWordCanvasToMain();
  };
};

/*
 * Function to draw each word canvas into the main canvas and delete the word canvas'.
*/
let pushWordCanvasToMain = () => {

  // This is a live node list, not a real array so we must convert it before we can work with it.
  // This array is built smallest word to largest
  let wordCanvasArray = [].slice.call( document.getElementsByClassName('temp-word-canvas') );
  // Reverse the order because we want to print the largest word first and sort around it
  wordCanvasArray = wordCanvasArray.reverse();
  let bodyTest = document.getElementsByTagName("body")[0];

  let positionArr = [];
    // canvas represents the actual canvas elements.
    for( let canvas of wordCanvasArray ) {

      console.log(canvas);

      let canvasPostions = createCanvasPositions();

      // Make sure the word is completely visible within the main canvas
      while( ( canvasPostions[0] + canvas['width'] ) > canvasContainer['width'] ||
             ( canvasPostions[1] + canvas['height'] ) > canvasContainer['height'] ) {

            if( !( canvasPostions[0] + canvas['width'] ) > canvasContainer['width'] &&
                !( canvasPostions[1] + canvas['height'] ) > canvasContainer['height'] ){
                  console.log('its on the page');
                  break;
                };
            canvasPostions = createCanvasPositions();
      };

      let topLeft = [ canvasPostions[0], canvasPostions[1] ]; //x1, y1
      let bottomRight = [ ( canvasPostions[0] + canvas['width'] ), ( canvasPostions[1] + canvas['height'] ) ]; // x2, y2

      positionArr.push( [ canvas['id'], canvas['width'], canvas['height'], canvasPostions[0], canvasPostions[1], topLeft, bottomRight ] );

      console.log(positionArr); //Array[10] -> Array[7] == canvas['id'], canvas['width'], canvas['height'], positionX, positionY, topLeft, bottomRight

      let iteratePostionArr = positionArr.entries();
      //let wordy;
      let wordy = iteratePostionArr.next();


    restartLoop:
    while(canvas && positionArr.length > 1) {
    //  while (!( wordy = iteratePostionArr.next()).done && positionArr.length > 1)
        //console.log('werwer')
        //console.log(wordy.value[0]);

            let compareX2 = wordy.value[1][6][0];
            let compareX1 = wordy.value[1][5][0];
            let compareY2 = wordy.value[1][6][1];
            let compareY1 = wordy.value[1][5][1];

            // console.log('topLeftX '+ topLeft[0] + ' < cBottomRightX ' +  compareX2);
            // console.log('bottomRightX '+ bottomRight[0] +' >  ctopLeftX '+ compareX1);
            // console.log('topLeftY '+ topLeft[1] +' <  cbottomRightY '+ compareY2);
            // console.log('bottomRightY '+ bottomRight[1] +' > ctopLeftY '+ compareY1);

          // If all of them are true then there is overlap.
          if( topLeft[0] < compareX2 &&
              bottomRight[0] > compareX1 &&
              topLeft[1] < compareY2 &&
              bottomRight[1] > compareY1 ) {
             /************************************/
             count += 1;
             console.log('continue restart ' + count);
             createCanvasPositions();
             if(count > 10000) { count = 0; console.log('5000 break!!! ');  break;}
             continue restartLoop;

            // If just one is false then there is no overlap
          } else {
            wordy = iteratePostionArr.next();
            count = 0;
          };

          if(iteratePostionArr.next().done) {
            count = 0
            console.log('break');
            break;
          };
      };
      // if there is no overlap or it's the first word, print it.
      if (iteratePostionArr.next().done || positionArr.length === 1 ) {
        console.log('no overlap');
        contextContainer.drawImage( canvas, topLeft[0], topLeft[1] );
        bodyTest.removeChild(canvas);
      };
    };
};

/*
 * Generate random coodinates based on the main canvas element.
*/
let createCanvasPositions = () => {
  let positionX = ( Math.floor(Math.random() * canvasContainer['width']) );
  let positionY = ( Math.floor(Math.random() * canvasContainer['height']) );
  return [positionX, positionY];
};

/*
 * Event listenser for our submit button.
*/
let submitButton = document.getElementsByClassName('sumbit-btn-js');

submitButton[0].addEventListener("click", () => {
  // Clear out the main canvas before push new words in on subsequent clicks.
  contextContainer.clearRect(0,0,1000,500);

  wordInputArray(document.querySelector('textarea').value);
}, false);
