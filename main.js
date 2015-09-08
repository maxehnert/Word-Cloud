'use strict';

// Setup our main canvas container.
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
 * Use the array of [[word, count],..] to construct individual canvas elements for each word.
 * Add styling to the words also.
*/
var wordInputArray = function wordInputArray(string) {

  var fontSize = undefined;

  // Map over the array
  var logMap = function logMap(value, map) {

    var word = value[0];

    /* Set a font size based on it's position in the array.
     * The most frequent word will be the largest.
     * map count is incremental 0-9.
     * 0 is the lowest count word
     * 20px is the smallest fontSize I want.
     */
    if (map === 0) {
      fontSize = 20;
    } else {
      fontSize += 5;
    };
    /*
     * Dynamically create Canvas elements for each word.
    */
    var canvas = document.createElement('canvas');
    canvas.className = 'temp-word-canvas';
    canvas.id = word;
    canvas.style.zIndex = 8;
    canvas.style.display = 'none';

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
    context.fillText(word, 0, 5);
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

  /*
   * Iterate over the wordCanvasArray we defined above.
   * Within this loop we check for overlap and draw the words into the main canvas.
   *
   * canvas represents the actual canvas elements.
  */
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = wordCanvasArray[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var canvas = _step2.value;

      //console.log(canvas);

      // These are the coordinates randomly generated.
      var canvasPostions = createCanvasPositions();

      /*
       * Make sure the word is completely visible within the main canvas.
      */
      while (canvasPostions[0] + canvas.width > canvasContainer.width || canvasPostions[1] + canvas.height > canvasContainer.height) {

        if (!(canvasPostions[0] + canvas.width) > canvasContainer.width && !(canvasPostions[1] + canvas.height) > canvasContainer.height) {
          //console.log('its on the page');
          break;
        };
        canvasPostions = createCanvasPositions();
      };

      /*
       * The next few lines build out dimenesions for the individual word's canvas el.
       * The dimensions of each word are stored in an array (positionArr) which is iterated over below.
      */
      var topLeft = [canvasPostions[0], canvasPostions[1]]; //x1, y1
      var bottomRight = [canvasPostions[0] + canvas.width, canvasPostions[1] + canvas.height]; // x2, y2

      positionArr.push([canvas.id, canvas.width, canvas.height, canvasPostions[0], canvasPostions[1], topLeft, bottomRight]);

      //console.log(positionArr); //Array[10] -> Array[7] == canvas['id'], canvas['width'], canvas['height'], positionX, positionY, topLeft, bottomRight

      var iteratePostionArr = positionArr.entries();
      var wordy = iteratePostionArr.next();

      /*
       * This while loop runs for each word and places it in
       * the main canvas el without overlapping other words.
      */
      restartLoop: while (canvas && positionArr.length > 1) {

        var compareX2 = wordy.value[1][6][0];
        var compareX1 = wordy.value[1][5][0];
        var compareY2 = wordy.value[1][6][1];
        var compareY1 = wordy.value[1][5][1];

        // console.log('topLeftX '+ topLeft[0] + ' < cBottomRightX ' +  compareX2);
        // console.log('bottomRightX '+ bottomRight[0] +' >  ctopLeftX '+ compareX1);
        // console.log('topLeftY '+ topLeft[1] +' <  cbottomRightY '+ compareY2);
        // console.log('bottomRightY '+ bottomRight[1] +' > ctopLeftY '+ compareY1);

        // If all of them are true then there is overlap.
        if (topLeft[0] < compareX2 && bottomRight[0] > compareX1 && topLeft[1] < compareY2 && bottomRight[1] > compareY1) {

          count += 1;
          //console.log('continue restart ' + count);
          createCanvasPositions();

          // If the count gets too high without finding a non-overlapping position, just kill it
          // It's a hack until I add memozation to the coordinant generator.
          if (count > 100000) {
            count = 0;console.log('5000 break!!! ');break;
          }
          continue restartLoop;

          // If just one is false then there is no overlap
        } else {
            wordy = iteratePostionArr.next();
            count = 0;
          };

        // Ok we've checked our current word against all other words.
        // In a perfect world it's ready to be drawn without overlap in the main canvas
        if (iteratePostionArr.next().done) {
          count = 0;
          //console.log('break');
          break;
        };
      };
      // if there is no overlap or it's the first word, print it.
      if (iteratePostionArr.next().done || positionArr.length === 1) {
        //console.log('no overlap');
        contextContainer.drawImage(canvas, topLeft[0], topLeft[1]);
        bodyTest.removeChild(canvas);
      };
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  ;
};

/*
 * Generate random coodinates based on the main canvas element.
*/
var createCanvasPositions = function createCanvasPositions() {
  var positionX = Math.floor(Math.random() * canvasContainer.width);
  var positionY = Math.floor(Math.random() * canvasContainer.height);
  return [positionX, positionY];
};

/*
 * Event listenser for our submit button.
*/
var submitButton = document.getElementsByClassName('sumbit-btn-js');

submitButton[0].addEventListener('click', function () {
  // Clear out the main canvas before push new words in on subsequent clicks.
  contextContainer.clearRect(0, 0, 1000, 500);

  wordInputArray(document.querySelector('textarea').value);
}, false);

var contentButton = document.getElementsByClassName('content-btn-js');

contentButton[0].addEventListener('click', function () {
  document.querySelector('textarea').value = randomContent;
});