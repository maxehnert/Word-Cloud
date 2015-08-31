"use strict";

// Crate our canvas container
var canvas = document.getElementById("canvas-container");
var context = canvas.getContext("2d");

let wordCloud = string => {

  let sortedWords = [];
  let word_object = {};
  let word;
  /* Should think about using new Map() instead of using an object and then later creating the same key,value array. It could elminate a loop and rduce O space and time*/

  // Loop through our array of words
  // Separate the string into individual words which also makes it an array
  for ( word of string.split(' ') ) {

    // For now lets set all words to lower case
  	word = word.toLowerCase();

    // If it's a new word, add it to our object
    if( !word_object[word] ) {
      word_object[word] = 1;
    }
    // If it's Not a new word, just increment it
    else {
    	word_object[word] += 1;
    }
  }

  // Loop through our word object so you can put them into an array
  for( word in word_object ) {
    // Setup some regex to stop any punctuation, numbers, or weird characters from getting through
    let valid_letters = /[a-z]/;

    // Push each key,value into an array of arrays
    if( valid_letters.test(word[0]) ) {
    	sortedWords.push( [word, word_object[word]] );
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
    // Write each word to the screen (easiest way to display the word cloud)
    // and set a font size based on it's position in the array.
    // The most frequent word will be the largest.
    var fontSize = value[1] * 15;

    context.fillStyle = "hsl(" + Math.random() * 360 + ", 100%, 50%)";
    context.font = `bold ${fontSize}px Arial`;
    context.fillText( value[0], Math.random() * 200 + 100 , Math.random() * 200 + 100 );

    // var containerTop = $('.text-output-js').offset().top;
    // var containerLeft = $('.text-output-js').offset().left;
    // console.log('top '+  (containerTop + Math.random() * 10));
    // $('.text-output-js').append(`<div class='words' style='font-size:${fontSize}px'>${value[0]}</div>`)
    //                     .offset({ top: containerTop + Math.random() * 10 ,
    //                               left: containerLeft + Math.random() * 10
    //                            });
  };

  wordCloud(string).forEach(logMap);
};

$('.sumbit-btn-js').click( () => {

  // Clear out the canvas element before adding anything else to it.
  context.clearRect(0, 0, canvas.width, canvas.height)

  doSomethingWithTheArray($('.text-input-js').val())

  // var words = d3.selectAll(".words");

  // words.style("color", () =>
  //    "hsl(" + Math.random() * 360 + ",100%,50%)"
  // );
});


/*
<canvas id="e" width="200" height="200"></canvas>
<script>
  var canvas = document.getElementById("canvas-container");
  var context = canvas.getContext("2d");
  context.fillStyle = "hsl(" + Math.random() * 360 + ",100%,50%)";
  context.font = "bold 16px Arial";
  context.fillText("Zibri", 100, 100);
</script>
*/
