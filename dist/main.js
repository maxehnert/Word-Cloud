'use strict';

// Setup our main canvas container.

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var canvasContainer = document.getElementById('canvas-container');
var contextContainer = canvasContainer.getContext('2d');

/*
 * Main function for parsing the block of text and pulling out the 10 most used words.
*/
var wordCloud = function wordCloud(string) {

  var sortedWords = [];
  var wordObject = {};
  var word = undefined;

  /*NOTE: Should think about using new Map() instead of using an object and then later creating the same key,value array. It could elminate a loop and rduce O space and time*/

  /*
   * Loop through our array of words.
   * Separate the string into individual words which also makes it an array.
  */
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = string.split(' ')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      word = _step.value;

      // For now lets set all words to lower case.
      word = word.toLowerCase();

      // If it's a new word, add it to our object.
      if (!wordObject[word]) {
        wordObject[word] = 1;
      }
      // If it's Not a new word, just increment it.
      else {
          wordObject[word] += 1;
        };
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  ;

  // Loop through our word object so you can put them into an array.
  for (word in wordObject) {
    // Setup some regex to stop any punctuation, numbers, or weird characters from getting through.
    var validLetters = /[a-z]/;

    // Push each key,value into an array of arrays
    if (validLetters.test(word) && word.length > 3) {
      sortedWords.push([word, wordObject[word]]);
    };
  };

  /*
   * Use the built in sorting method to sort by value.
   * Only keep the last 10 elements (they have the largest count).
  */
  sortedWords = sortedWords.sort(function (a, b) {
    return a[1] - b[1];
  }).slice(-10);
  return sortedWords;
};

/*
 * Create a Class for drawing our words to Canvas elements.
*/

var wordCanvas = (function () {
  function wordCanvas() {
    _classCallCheck(this, wordCanvas);
  }

  _createClass(wordCanvas, [{
    key: 'draw',
    value: function draw(word, fontSize) {

      /*
       * Dynamically create Canvas elements for each word.
      */
      var canvas = document.createElement('canvas');
      canvas.className = 'temp-word-canvas';
      canvas.id = word;
      canvas.style.zIndex = 8;
      //canvas.style.display = 'none';

      var bodyTest = document.getElementsByTagName('body')[0];
      bodyTest.appendChild(canvas);
      var canvas = document.getElementById(word);
      var context = canvas.getContext('2d');
      context.font = 'bold ' + fontSize + 'px Arial';
      canvas.width = context.measureText(word).width;

      //TODO: This works for right now for getting the whole word in the element, but better to add a checker /A-Z/ and f,g,j,p and add height and offset based on a needed param.
      canvas.height = fontSize + 5;
      context.textBaseline = "hanging";
      // Size noted above
      context.font = 'bold ' + fontSize + 'px Arial';
      // This sets a random color for the word.
      context.fillStyle = 'hsl( ' + Math.random() * 360 + ', 100%, 50%)';

      // fillText is what draws it to the screen.
      context.fillText(word, 0, 5);
    }
  }]);

  return wordCanvas;
})();

;

/*
 * Use the array of [[word, count],..] to construct individual canvas elements for each word.
 * Add styling to the words also.
*/
var wordInputArray = function wordInputArray(string) {

  var fontSize = undefined;

  // Map over the array
  var logMap = function logMap(value, index, x) {

    var word = value[0];

    /* Set a font size based on it's position in the array.
     * The most frequent word will be the largest.
     * index count is incremental 0-9.
     * 0 is the lowest count word
     * 20px is the smallest fontSize I want.
     */
    if (index === 0) {
      fontSize = 20;
    } else {
      fontSize += 5;
    };

    /*
     * Create new Canvas element for each word.
    */
    var temporaryWordCanvas = new wordCanvas();
    temporaryWordCanvas.draw(word, fontSize);
  };

  wordCloud(string).forEach(logMap);

  // Make sure this only runs when we have all the words in their own canvas el.
  if (document.getElementsByClassName('temp-word-canvas').length === wordCloud(string).length) {
    pushWordCanvasToMain();

    /*
     * Temp fix for removing word canvas el that didn't get placed
     * Get rid of the words that didn't make it into the main canvas so we can run it again
    */
    while (document.getElementsByClassName('temp-word-canvas').length) {
      var node = document.getElementsByClassName('temp-word-canvas')[0];
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      };
    };
  };
};

/*
 * Function to draw each word canvas into the main canvas and delete the word canvas'.
*/
var pushWordCanvasToMain = function pushWordCanvasToMain() {

  // This is a live node list, not a real array so we must convert it before we can work with it.
  // This array is built smallest word to largest
  var wordCanvasArray = [].slice.call(document.getElementsByClassName('temp-word-canvas'));

  // Reverse the order because we want to print the largest word first and sort around it
  wordCanvasArray = wordCanvasArray.reverse();
  var bodyTest = document.getElementsByTagName('body')[0];

  var positionArr = [];

  var count = 0;

  // This will keep track of where we are in the spiral;
  var spiralAngle = 0;

  /***********START*******TEST***************/

  var positionArr1 = [];

  // this iterates over each canvas element in the array of canvas elements
  var testFunc = function testFunc(value, index, arr) {
    //value = canvas element
    //index = the array index
    //arr = the array of canvas elements
    //arr[index] = the canvas element
    //value.id = this is the #id name of the word
    var canvas = value;

    var canvasCoordinates = createSpiralPositions(spiralAngle);

    var topLeft1 = [canvasCoordinates[0], canvasCoordinates[1]]; //x1, y1
    var bottomRight1 = [canvasCoordinates[0] + canvas.width, canvasCoordinates[1] + canvas.height]; // x2, y2

    // this is a new array of coordinates. It should build in size with each time the forEach runs
    positionArr1.push([canvas.id, canvas.width, canvas.height, canvasCoordinates[0], canvasCoordinates[1], topLeft1, bottomRight1]);
    //console.log(positionArr1); //Array[10] -> Array[7] == canvas['id'], canvas['width'], canvas['height'], positionX, positionY, topLeft, bottomRight

    // For the first word just print it in the main canvas
    if (index === 0) {
      console.log('hiiii');
      contextContainer.drawImage(canvas, topLeft1[0], topLeft1[1]);
      bodyTest.removeChild(canvas);
    } else {
      positionArr1.forEach(function (value, index, array) {
        // value = each positionArr1 element. this contains the entire coordinates. The last 'value' element is itself. so you need to not check the last one because it'll be comparing itself.
        // index = the current index of the positionArr1 array.
        // array = the entire positionArr1 array.
        //  console.log('current word/last word? arr[arr.length - 1] '); console.log(array[array.length - 1]);

        var compareX2 = value[6][0];
        var compareX1 = value[5][0];
        var compareY2 = value[6][1];
        var compareY1 = value[5][1];

        var currentWord = array[array.length - 1];

        console.log('value[0] ' + value[0] + ' ' + 'currentWord ' + currentWord[0]);
        //  console.log('topLeftX '+ topLeft[0] + ' < cBottomRightX ' +  compareX2);
        //  console.log('bottomRightX '+ bottomRight[0] +' >  ctopLeftX '+ compareX1);
        //  console.log('topLeftY '+ topLeft[1] +' <  cbottomRightY '+ compareY2);
        //  console.log('bottomRightY '+ bottomRight[1] +' > ctopLeftY '+ compareY1);

        // If all of them are true then there is overlap.
        // Skip the last word because it'd be comparing itself to itself
        restartThisLoop: while (currentWord[5][0] < compareX2 && currentWord[6][0] > compareX1 && currentWord[5][1] < compareY2 && currentWord[6][1] > compareY1 || value[0] !== currentWord[0]) {

          spiralAngle = spiralAngle + 20;
          canvasCoordinates = createSpiralPositions(spiralAngle);

          var topLeft = [canvasCoordinates[0], canvasCoordinates[1]]; //x1, y1
          var bottomRight = [canvasCoordinates[0] + canvas.width, canvasCoordinates[1] + canvas.height]; // x2, y2
          positionArr1.pop();
          positionArr1.push([canvas.id, canvas.width, canvas.height, canvasCoordinates[0], canvasCoordinates[1], topLeft, bottomRight]);
          //  if ( !topLeft[0] < compareX2 ||
          //       !bottomRight[0] > compareX1 ||
          //       !topLeft[1] < compareY2 ||
          //       !bottomRight[1] > compareY1 ) {
          //          count = 0;
          //          spiralAngle = 0;
          //          break;
          //   }
          continue restartThisLoop;
        }
        if (value[0] === currentWord[0]) {
          contextContainer.drawImage(canvas, currentWord[0], currentWord[1]);
          bodyTest.removeChild(canvas);
          count = 0;
          spiralAngle = 0;
        }
      });
    }
  };

  wordCanvasArray.forEach(testFunc);

  /***********END****TEST***************/

  /*
   * Iterate over the wordCanvasArray we defined above.
   * Within this loop we check for overlap and draw the words into the main canvas.
   *
   * canvas represents the actual canvas elements.
  */
  //   for ( let canvas of wordCanvasArray ) {
  //     console.log(canvas);
  //
  //     // These are the coordinates randomly generated.
  //     //let canvasCoordinates = createCanvasPositions();
  //
  //     let canvasCoordinates = createSpiralPositions(spiralAngle);
  //
  //     /*
  //      * Make sure the word is completely visible within the main canvas.
  //     */
  //     while ( ( canvasCoordinates[0] + canvas.width ) > canvasContainer.width ||
  //            ( canvasCoordinates[1] + canvas.height ) > canvasContainer.height ) {
  //
  //           if ( !( canvasCoordinates[0] + canvas.width ) > canvasContainer.width &&
  //               !( canvasCoordinates[1] + canvas.height ) > canvasContainer.height ) {
  //                 //console.log('its on the page');
  //                 break;
  //           };
  //
  //             spiralAngle = spiralAngle + 20;
  //             canvasCoordinates = createSpiralPositions(spiralAngle);
  //
  //           if( count > 500000 || spiralAngle > 1000) {
  //               count = 0; spiralAngle = 0; console.log('in canvas ');  break;
  //             }
  //
  //
  //     };
  //
  //     /*
  //      * The next few lines build out dimenesions for the individual word's canvas el.
  //      * The dimensions of each word are stored in an array (positionArr) which is iterated over below.
  //     */
  //
  //     var topLeft = [ canvasCoordinates[0], canvasCoordinates[1] ]; //x1, y1
  //     var bottomRight = [ ( canvasCoordinates[0] + canvas.width ), ( canvasCoordinates[1] + canvas.height ) ]; // x2, y2
  //
  //     positionArr.push( [ canvas.id, canvas.width, canvas.height, canvasCoordinates[0], canvasCoordinates[1], topLeft, bottomRight ] );
  //
  // //    console.log(positionArr); //Array[10] -> Array[7] == canvas['id'], canvas['width'], canvas['height'], positionX, positionY, topLeft, bottomRight
  //
  //     //  var iteratePostionArr = positionArr.entries();
  //     //  var wordy = iteratePostionArr.next();
  //
  //     /*
  //      * This while loop runs for each word and places it in
  //      * the main canvas el without overlapping other words.
  //     */
  //   //  while ( canvas && positionArr.length > 1 ) {
  //
  //         positionArr.forEach( function(i) {
  //
  //           let compareX2 = i[6][0];
  //           let compareX1 = i[5][0];
  //           let compareY2 = i[6][1];
  //           let compareY1 = i[5][1];
  //
  //           let currentWord = positionArr[positionArr.length - 1 ];
  //       //  console.log('topLeftX '+ topLeft[0] + ' < cBottomRightX ' +  compareX2);
  //       //  console.log('bottomRightX '+ bottomRight[0] +' >  ctopLeftX '+ compareX1);
  //       //  console.log('topLeftY '+ topLeft[1] +' <  cbottomRightY '+ compareY2);
  //       //  console.log('bottomRightY '+ bottomRight[1] +' > ctopLeftY '+ compareY1);
  //
  //       // If all of them are true then there is overlap.
  //       restartLoop:
  //        while ( currentWord[5][0] < compareX2 &&
  //                currentWord[6][0] > compareX1 &&
  //                currentWord[5][1] < compareY2 &&
  //                currentWord[6][1] > compareY1 ) {
  //         // restartLoop:
  //         //  while ( topLeft[0] < compareX2 &&
  //         //          bottomRight[0] > compareX1 &&
  //         //          topLeft[1] < compareY2 &&
  //         //          bottomRight[1] > compareY1 ) {
  //
  //             count += 1;
  //
  //             //console.log('IS THIS RIGHT? topLeftY '+ topLeft[1] +' <  cbottomRightY '+ compareY2);
  //
  //             positionArr.pop();
  //
  //             spiralAngle = spiralAngle + 20;
  //             canvasCoordinates = createSpiralPositions(spiralAngle);
  //
  //             var topLeft = [ canvasCoordinates[0], canvasCoordinates[1] ]; //x1, y1
  //             var bottomRight = [ ( canvasCoordinates[0] + canvas.width ), ( canvasCoordinates[1] + canvas.height ) ]; // x2, y2
  //
  //             positionArr.push( [ canvas.id, canvas.width, canvas.height, canvasCoordinates[0], canvasCoordinates[1], topLeft, bottomRight ] );
  //
  //             // If just one is false then there is no overlap
  //             if ( !topLeft[0] < compareX2 ||
  //                  !bottomRight[0] > compareX1 ||
  //                  !topLeft[1] < compareY2 ||
  //                  !bottomRight[1] > compareY1 ) {
  //
  //                     contextContainer.drawImage( canvas, topLeft[0], topLeft[1] );
  //                     bodyTest.removeChild(canvas);
  //                     count = 0;
  //                     spiralAngle = 0;
  //                     break;
  //                  }
  //
  //              // If the count gets too high without finding a non-overlapping position, just kill it
  //              // It's a hack until I add memozation to the coordinant generator.
  //              if( count > 1000 || spiralAngle > 1080) { count = 0; spiralAngle = 0; console.log('5000 break!!! ');  break;}
  //
  //              continue restartLoop;
  //
  //       };
  //     });//foreach
  //     };
  //     // if there is no overlap or it's the first word, print it.
  //     if ( positionArr.length === 1 ) {
  //
  //       contextContainer.drawImage( canvas, topLeft[0], topLeft[1] );
  //       bodyTest.removeChild(canvas);
  //     };
  //}; //while ( canvas && positionArr.length > 1 )
};

/*
 * Generate random coodinates based on the main canvas element.
*/
var createCanvasPositions = function createCanvasPositions() {
  var positionX = Math.floor(Math.random() * canvasContainer.width);
  var positionY = Math.floor(Math.random() * canvasContainer.height);
  return [positionX, positionY];
};

// Start Spiral
var createSpiralPositions = function createSpiralPositions(increment) {
  var a = 1;
  var b = 3;
  // var centerx = contextContainer.canvas.width / 2;
  // var centery = contextContainer.canvas.height / 2;
  var centerx = 500 / 2;
  var centery = 500 / 2;
  //console.log('increment '+ increment);
  var angle = 0.1 * increment;

  var positionX = centerx + (a + b * angle) * Math.cos(angle);

  var positionY = centery + (a + b * angle) * Math.sin(angle);

  return [positionX, positionY];
};
// End Spiral

/*
 * Event listenser for our submit button.
*/
var submitButton = document.getElementsByClassName('sumbit-btn-js');

submitButton[0].addEventListener('click', function () {

  // Clear out the main canvas before push new words in on subsequent clicks.
  contextContainer.clearRect(0, 0, canvasContainer.width, canvasContainer.height);

  wordInputArray(document.querySelector('textarea').value);
}, false);

/*
 * Event listenser to fill the textarea
*/
var contentButton = document.getElementsByClassName('content-btn-js');

contentButton[0].addEventListener('click', function () {
  document.querySelector('textarea').value = randomContent;
});