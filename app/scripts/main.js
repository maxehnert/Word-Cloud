'use strict';

// Setup our main canvas container.
var canvasContainer = document.getElementById("canvas-container");
var contextContainer = canvasContainer.getContext("2d");
var count1 = 0;
var count2 = 0;
var count3 = 0;

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

    var word = value[0];

    /* Set a font size based on it's position in the array.
     * The most frequent word will be the largest.
     * map count is incremental 0-9.
     * 0 is the lowest count word
     */
    if ( map == 0 ) {
      var fontSize = map + 0.5 * 16;
    } else var fontSize = map * 16;
      //console.log(map);

    //console.log(value);

    /*
     * Dynamically create Canvas elements for each word.
    */
    var canvas = document.createElement('canvas');
    canvas.className = "temp-word-canvas";
    canvas.id = word;
    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.style.display = "none";

    var bodyTest = document.getElementsByTagName("body")[0];
    bodyTest.appendChild(canvas);
    var canvas = document.getElementById(word);
    var context = canvas.getContext("2d");
    context.font = `bold ${fontSize}px Arial`;
    canvas.width = context.measureText(word).width;

    //TODO: This works for right now for getting the whole word in the element, but better to add a checker /A-Z/ and f,g,j,p and add height and offset based on a needed param.
    canvas.height = fontSize + 5;
    // Size noted above
    context.font = `bold ${fontSize}px Arial`;
    // This sets a random color for the word.
    context.fillStyle = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
    context.textBaseline = "hanging";
    context.fillText( word, 0, 5);

  };

  wordCloud(string).forEach(logMap);

  // Make sure this only runs when we have all the words in their own canvas el.
  if( document.getElementsByClassName("temp-word-canvas").length == wordCloud(string).length ) {
    pushWordCanvasToMain();
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
      //console.log(canvas['id']);
      //console.log(canvas['height']);


      let canvasPostions = createCanvasPositions();

      let topLeft = [ canvasPostions[0], canvasPostions[1] ]; //x1, y1
      let bottomRight = [ ( canvasPostions[0] + canvas['width'] ), canvasPostions[1] ]; // x2, y2

      positionArr.push( [ canvas['id'], canvas['width'], canvas['height'], canvasPostions[0], canvasPostions[1], topLeft, bottomRight ] );

      console.log(positionArr); //Array[10] -> Array[7] == canvas['id'], canvas['width'], canvas['height'], positionX, positionY, topLeft, bottomRight

      let iteratePostionArr = positionArr.entries();
      let wordy;
      restartLoop:
      while (!( wordy = iteratePostionArr.next()).done && positionArr.length > 1) {
        console.log('werwer')
        console.log(wordy.value[0]);
        console.log(topLeft[0] + ' '+ topLeft[1]);
        console.log(wordy.value[1][6]);
          //console.log(wordy.value[1][6][1]);
          //if( wordy.value[1][0] == 'external:') { console.log(wordy.value[1][0]); break;}

            // If all of them are true then there is overlap.
            // If just one is not true then there is no overlap
          if( (topLeft[0] < wordy.value[1][6][0] &&
              bottomRight[0] > wordy.value[1][5][0] &&
              topLeft[1] < wordy.value[1][6][1] &&
              bottomRight[1] > wordy.value[1][5][1]) || positionArr.length === 1 ) {
             /************************************/
             console.log('no overlap');
             contextContainer.drawImage( canvas, topLeft[0], topLeft[1] );
             bodyTest.removeChild(canvas);

              } else {
                console.log('aaaahhhhh');
                console.log(wordy.value[1][0]);
                createCanvasPositions();
                continue restartLoop;
              }
      }
      // if there is no overlap or it's the first word, print it.
      // if (iteratePostionArr.next().done || positionArr.length === 1 ){
      //   console.log('no overlap');
      //   contextContainer.drawImage( canvas, topLeft[0], topLeft[1] );
      //   bodyTest.removeChild(canvas);
      // }


      // for(let word of positionArr) {
      //   console.log('topleft');
      //   console.log(topLeft[0]);
      //   console.log('word'); console.log(word);
      //   // word[5] == topLeft array
      //   // word[6] == bottomRight array
      //
      //   /*
      //    * Overlap Detection
      //    *
      //    * Current problem: if it passes on the first word then it stops and doesn't check any of the other words before it. I think I need another loop in this one to scan over it before making a decision to push the word into the main canvas.
      //    *
      //    * I'm using swapped signs from my test case because I only want the word to print
      //    * if there is NOT an overlap.
      //    * If there IS overlap then I will generate new coordinates.
      //    * Repeate this until it places the word.
      //    * If the run time gets too long I will start excluding taken ranges from the random num generator.
      //   */
      //   if( topLeft[0] < word[6][0] &&
      //       bottomRight[0] > word[5][0] &&
      //       topLeft[1] < word[6][1] &&
      //       bottomRight[1] > word[5][1] ) {
      //       ////////////////////////////
      //       count1 +=1;
      //       createCanvasPositions();
      //
      //     } else {
      //       count2 +=1;
      //       // There is no collision so push the word into the canvas
      //       contextContainer.drawImage( canvas, topLeft[0], topLeft[1] );
      //       bodyTest.removeChild(canvas);
      //       break;
      //     }
      //
      // }

    };
};

/*
 * Generate random coodinates based on the main canvas element.
*/
let createCanvasPositions = () => {
  let positionX = ( Math.floor(Math.random() * canvasContainer['width']) );
  let positionY = ( Math.floor(Math.random() * canvasContainer['height']) );
  count3 +=1;
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
