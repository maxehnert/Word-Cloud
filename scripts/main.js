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
"use strict";

var randomContent = "I have given a talk with this title many times, and it turns out from discussions after the talk I could have just as well have called it “You and Your Engineering Career”, or even “You and Your Career”. But I left the word “Research” in the title because that is what I have most studied.\nFrom the previous chapters you have an adequate background for how I made the study, and I need not mention again the names of the famous people I have studied closely. The earlier chapters are, in a sense, just a great expansion, with much more detail, of the original talk. This chapter is, in a sense, a summary of the previous 29 chapters.\nWhy do I believe this talk is important? It is important because as far as I know each of you has but one life to lead, and it seems to me it is better to do significant things than to just get along through life to its end. Certainly near the end it is nice to look back at a life of accomplishments rather than a life where you have merely survived and amused yourself. Thus in a real sense I am preaching the message: (1) it is worth trying to accomplish the goals you set yourself, and (2) it is worth setting yourself high goals.\nAgain, to be convincing to you I will talk mainly about my own experience, but there are equivalent stories I could use involving others. I want to get you to the state where you will say to yourself, “Yes, I would like to do first class work. If Hamming could, then why not me?” Our society frowns on those who say this too loudly, but I only ask you say it to yourself! What you consider first class work is up to you; you must pick your goals, but make them high!\nI will start psychologically rather than logically. The major objection cited by people against striving to do great things is the belief it is all a matter of luck. I have repeatedly cited Pasteur’s remark, “Luck favors the prepared mind”. It both admits there is an element of luck, and yet claims to a great extent it is up to you. You prepare yourself to succeed, or not, as you choose, from moment to moment, by the way you live your life.\nAs an example related to the “luck” aspect, when I first came to Bell Telephone Laboratories I shared an office with Claude Shannon. At about the same time he created Information Theory and I created Coding Theory. They were “in the air” you can say, and you are right. Yet, why did we do it and the others who were also there not do it? Luck? Some, perhaps, but also because we were what we were and the others were what they were. The differences were we were more prepared to find, work on, and create the corresponding theories.\nIf it were mainly luck then great things should not tend to be done repeatedly by the same people. Shannon did lot of important things besides Information Theory—his Master’s Thesis was applying Boolean Algebra to switching circuits! Einstein did many great things, not just one or two. For example when he was around 12–14 years old he asked himself what light would look like if he went at the velocity of light. He would, apparently, see a local peak, yet the corresponding mathematical equations would not support a stationary extreme! An obvious contradiction! Is it surprising he later discovered Special Relativity which was\n210 CHAPTER 30\nin the air and many people were working on it at that time? He had prepared himself long ago, by that early question, to understand better than the others what was going on and how to approach it.\nNewton observed if others would think as hard as he did then they would be able to do the same things. Edison said genius was 99% perspiration and 1% inspiration. It is hard work, applied for long years, which leads to the creative act, and it is rarely just handed to you without any serious effort on your part. Yes, sometimes it just happens, and then it is pure luck. It seems to me to be folly for you to depend solely on luck for the outcome of this one life you have to lead.\nOne of the characteristics you see is great people when young were generally active—though Newton did not seem exceptional until after well into undergraduate days at Cambridge. Einstein was not a great student, and many other great people were not at the top of their class.\nBrains are nice to have, but many people who seem not to have great IQs have done great things. At Bell Telephone Laboratories Bill Pfann walked into my office one day with a problem in zone melting. He did not seem to me, then, to know much mathematics, to be articulate, or to have a lot of clever brains, but I had already learned brains come in many forms and flavors, and to beware of ignoring any chance I got to work with a good man. I first did a little analytical work on his equations, and soon realized what he needed was computing. I checked up on him by asking around in his department, and I found they had a low opinion of him and his idea for zone melting. But that is not the first time a person has not been appreciated locally, and I was not about to lose my chance of working with a great idea—which is what zone melting seemed to me, though not to his own department! There is an old saying; “A prophet is without honor in his own country”. Mohammed fled from his own city to a nearby one and there got his first real recognition!\nSo I helped Bill Pfann, taught him how to use the computer, how to get numerical solutions to his problems, and let him have all the machine time he needed. It turned out zone melting was just what we needed to purify materials for transistors, for example, and has proved to be essential in many areas of work. He ended up with all the prizes in the field, much more articulate as his confidence grew, and the other day I found his old lab is now a part of a National Monument! Ability comes in many forms, and on the surface the variety is great; below the surface there are many common elements.\nHaving disposed of the psychological objections of luck and the lack of high IQ type brains, let us go on to how to do great things. Among the important properties to have is the belief you can do important things. If you do not work on important problems how can you expect to do important work? Yet, direct observation, and direct questioning of people, shows most scientists spend most of their time working on things they believe are not important nor are they likely to lead to important things.\nAs an example, after I had been eating for some years with the Physics table at the Bell Telephone Laboratories restaurant, fame, promotion, and hiring by other companies ruined the average quality of the people so I shifted to the Chemistry table in another corner of the restaurant. I began by asking what the important problems were in chemistry, then later what important problems they were working on, and finally one day said, “If what you are working on is not important and not likely to lead to important things, then why are you working on it?” After that I was not welcome and had to shift to eating with the Engineers! That was in the spring, and in the fall one of the chemists stopped me in the hall and said, “What you said caused me to think for the whole summer about what the important problems are in my field, and while I have not changed my research it was well worth the effort”. I thanked him and went on—and noticed in a few months he was made head of the group. About 10 years ago I saw he became a member of the National Academy of Engineering. No other person at the table did I ever hear of, and no other person was capable of responding to the question I had asked, “Why are you not working on and thinking about the important problems in your area?” If you do not work on important problems then it is obvious you have little chance of doing important things.\nConfidence in yourself, then, is an essential property. Or if you want to you can call it “courage”. Shannon had courage. Who else but a man with almost infinite courage would ever think of averaging over all random codes and expect the average code would be good? He knew what he was doing was important and pursued it intensely. Courage, or confidence, is a property to develop in yourself. Look at your successes, and pay less attention to failures than you are usually advised to do in the expression, “Learn from your mistakes”. While playing chess Shannon would often advance his queen boldly into the fray and say, “I ain’t scaird of nothing”. I learned to repeat it to myself when stuck, and at times it has enabled me to go on to a success. I deliberately copied a part of the style of a great scientist. The courage to continue is essential since great research often has long periods with no success and many discouragements.\nThe desire for excellence is an essential feature for doing great work. Without such a goal you will tend to wander like a drunken sailor. The sailor takes one step in one direction and the next in some independent direction. As a result the steps tend to cancel each other, and the expected distance from the starting point is proportional to the square root of the number of steps taken. With a vision of excellence, and with the goal of doing significant work, there is tendency for the steps to go in the same direction and thus go a distance proportional to the number of steps taken, which in a lifetime is a large number indeed. As noted before, chapter 1, the difference between having a vision and not having a vision, is almost everything, and doing excellent work provides a goal which is steady in this world of constant change.\nAge is a factor physicists and mathematicians worry about. It is easily observed the greatest work of a theoretical physicist, mathematician, or astrophysicist, is generally done very early. They may continue to do good work all their lives, but what society ends up valuing most is almost always their earliest great work. The exceptions are very, very few indeed. But in literature, music composition, and politics, age seems to be an asset. The best compositions of a composer are usually the late ones, as judged by popular opinion.\nOne reason for this is fame in Science is a curse to quality productivity, though it tends to supply all the tools and freedom you want to do great things. Another reason is most famous people, sooner or later, tend to think they can only work on important problems—hence they fail to plant the little acorns which grow into the mighty oak trees. I have seen it many times, from Brattain of transistor fame and a Nobel Prize to Shannon and his Information Theory. Not that you should merely work on random things—but on small things which seem to you to have the possibility of future growth. In my opinion the Institute for Advanced Study at Princeton, N.J has ruined more great scientists than any other place has created—considering what they did before ore and what they did after going there. A few, like von Neumann, escaped the closed atmosphere of the place with all its physical comforts and prestige, and continued to contribute to the advancement of Science, but most remained there and continued to work on the same problems which got them there but which were generally no longer of great importance to society.\nThus what you consider to be good working conditions may not be good for you! There are many illustrations of this point. For example, working with one’s door closed lets you get more work done per year than if you had an open door, but I have observed repeatedly later those with the closed doors, while working just as hard as others, seem to work on slightly the wrong problems, while those who have let their door stay open get less work done but tend to work on the right problems! I cannot prove the cause and effect relationship, I only observed the correlation. I suspect the open mind leads to the open door, and the open door tends to lead to the open mind; they reinforce each other.\nA similar story from my own experience. In the early days of programming computers in absolute binary the usual approach was usually through an “acre of programmers”. It was soon evident to me Bell Telephone Laboratories would never give me an acre of programmers. What to do? I could go to a West Coast airframe manufacturer and get a job and have the proverbial acre, but Bell Telephone Laboratories had a fascinating collection of great people from whom I could learn a lot, and the airframe manufacturers\nYOU AND YOUR RESEARCH 211\n212 CHAPTER 30\nhad relatively fewer such people. After quite a few weeks of wondering what to do I finally said to myself, “Hamming, you believe machines can do symbol manipulation, why not get them to do the details of the programming?” Thus I was led directly to a frontier of Computer Science by simply inverting the problem. What had seemed to be a defect now became an asset and pushed me in the right direction! Grace Hopper had a number of similar stories from Computer Science, and there are many other stories with the same moral: when stuck often inverting the problem, and realizing the new formulation is better, represents a significant step forward. I am not asserting all blockages can be so rearranged, but I am asserting many more than you might at first suspect can be so changed from a more or less routine response to a great one.\nThis is related to another aspect of changing the problem. I was once solving on a digital computer the first really large simulation of a system of simultaneous differential equations which at that time were the natural problem for an analog computer—but they had not been able to do it and I was doing it on an IBM 701. The method of integration was an adaptation of the classical Milne’s method, and was ugly to say the least. I suddenly realized of course, being a military problem, I would have to file a report on how it was done, and every analog installation would go over it trying to object to what was actually being proved as against just getting the answers— I was showing convincingly on some large problems the digital computer could beat the analog computer on its own home ground. Realizing this, I realized the method of solution should be cleaned up, so I developed a new method of integration which had a nice theory, changed the method on the machine with a change of comparatively few instructions, and then computed the rest of the trajectories using the new formula. I published the new method and for some years it was in wide use and known as “Hamming’s method”. I do not recommend the method now further progress has been made and the computers are different. To repeat the point I am making, I changed the problem from just getting answers to the realization I was demonstrating clearly for the first time the superiority of digital computers over the current analog computers, thus making a significant contribution to the science behind the activity of computing answers.\nAll these stories show the conditions you tend to want are seldom the best ones for you—the interaction with harsh reality tends to push you into significant discoveries which otherwise you would never have thought about while doing pure research in a vacuum of your private interests.\nNow to the matter of drive. Looking around you can easily observe great people have a great deal of drive to do things. I had worked with John Tukey for some years before I found he was essentially my age, so I went to our mutual boss and asked him, “How can anyone my age know as much as John Tukey does?” He leaned back, grinned, and said, “You would be surprised how much you would know if you had worked as hard as he has for as many years”. There was nothing for me to do but slink out of his office, which I did. I thought about the remark for some weeks and decided, while I could never work as hard as John did, I could do a lot better than I had been doing.\nIn a sense my boss was saying intellectual investment is like compound interest, the more you do the more you learn how to do, so the more you can do, etc. I do not know what compound interest rate to assign, but it must be well over 6%—one extra hour per day over a lifetime will much more than double the total output. The steady application of a bit more effort has a great total accumulation.\nBut be careful—the race is not to the one who works hardest! You need to work on the right problem at the right time and in the right way—what I have been calling “style”. At the urging of others, for some years I set aside Friday afternoons for “great thoughts”. Of course I would answer the telephone, sign a letter, and such trivia, but essentially, once lunch started, I would only think great thoughts—what was the nature of computing, how would it affect the development of science, what was the natural role of computers in Bell Telephone Laboratories, what effect will computers have on AT&T, on Science generally? I found it was well worth the 10% of my time to do this careful examination of where computing was heading so I would\nknow where we were going and hence could go in the right direction. I was not the drunken sailor staggering around and canceling many of my steps by random other steps, but could progress in a more or less straight line. I could also keep a sharp eye on the important problems and see that my major effort went to them.\nI strongly recommend this taking the time, on a regular basis, to ask the larger questions and not stay immersed in the sea of detail where almost every one stays almost all of the time. These chapters have regularly stressed the bigger picture, and if you are to be leader into the future, rather than to be a follower of others, I am now saying it seems to me to be necessary for you to look at the bigger picture on a regular, frequent basis for many years.\nThere is another trait of great people I must talk about—and it took me a long time to realize it. Great people can tolerate ambiguity, they can both believe and disbelieve at the same time. You must be able to believe your organization and field of research is the best there is, but also there is much room for improvement! You can sort of see why this is a necessary trait If you believe too much you will not likely see the chances for significant improvements, you will see believe enough you will be filled with doubts and get very little chances for only the 2%, 5%, and 10% improvements; if you do not done. I have not the faintest idea of how to teach the tolerance of ambiguity, both belief and disbelief at the same time, but great people do it all the time.\nMost great people also have 10 to 20 problems they regard as basic and of great importance, and which they currently do not know how to solve. They keep them in their mind, hoping to get a clue as to how to solve them. When a clue does appear they generally drop other things and get to work immediately on the important problem. Therefore they tend to come in first, and the others who come in later are soon forgotten. I must warn you however, the importance of the result is not the measure of the importance of the problem. The three problems in Physics, antigravity, teleportation, and time travel are seldom worked on because we have so few clues as to how to start—a problem is important partly because there is a possible attack on it, and not because of its inherent importance.\nThere have been a number of times in the book when I came close to the point of saying it is not so much what you do as how you do it. I just told you about the changing of the problem of solving a given set of differential equations on an analog machine to doing on a digital computer, changing progamming from an acre of programmers to letting the machine do much of the mechanical part, and there are many similar stories. Doing the job with “style” is important. As the old song says, “It ain’t what you do if s the way that you do it”. Look over what you have done, and recast it in a proper form—I do not mean give it false importance, nor propagandize for it, nor pretend it is not what it is, but I do say by presenting it in its basic, fundamental form, it may have a larger range of application than was first thought possible.\nAgain, you should do your job in such a fashion others can build on top of it. Do not in the process try to make yourself indispensable; if you do then you cannot be promoted because you will be the only one who can do what you are now doing! I have seen a number of times where this clinging to the exclusive rights to the idea has in the long run done much harm to the individual and to the organization. If you are to get recognition then others must use your results, adopt, adapt, extend, and elaborate them, and in the process give you credit for it. I have long held the attitude of telling every one freely of my ideas, and in my long career I have had only one important idea “stolen” by another person. I have found people are remarkably honest if you are in your turn.\nIt is a poor workman who blames his tools. I have always tried to adopt the philosophy I will do the best I can in the given circumstances, and after it is all over maybe I will try to see things are better next time. This school is not perfect, but for each class I try to do as well as I can and not spend my effort trying to reform every small blemish in the system. I did change Bell Telephone Laboratories significantly, but did\nYOU AND YOUR RESEARCH 213\n214 CHAPTER 30\nnot spend much effort on trivial details—I let others do that if they wanted to—but I got on with the main task as I saw it. Do you want to be a reformer of the trivia of your old organization or a creator of the new organization? Pick your choice, but be clear which path you are going down.\nI must come to the topic of “selling” new ideas. You must master three things to do this (Chapter 5):\n1. giving formal presentations,\n2. producing written reports,\n3. master the art of informal presentations as they happen to occur.\nAll three are essential—you must learn to sell your ideas, not by propaganda, but by force of clear presentation. I am sorry to have to point this out; many scientists and others think good ideas will win out automatically and need not be carefully presented. They are wrong; many a good idea has had to be rediscovered because it was not well presented the first time, years before! New ideas are automatically resisted by the establishment, and to some extent justly. The organization cannot be in a continual state of ferment and change; but it should respond to significant changes.\nChange does not mean progress, but progress requires change.\nTo master the presentation of ideas, while books on the topic may be partly useful, I strongly suggest you adopt the habit of privately critiquing all presentations you attend and also asking the opinions of others. Try to find those parts which you think are effective and which also can be adapted to your style. And this includes the gentle art of telling jokes at times. Certainly a good after dinner speech requires three well told jokes, one at the beginning, one in the middle to wake them up again, and the best one at the end so they will remember at least one thing you said!\nYou are likely to be saying to yourself you have not the freedom to work on what you believe you should when you want to. I did not either for many years—I had to establish the reputation on my own time that I could do important work, and only then was I given the time to do it. You do not hire a plumber to learn plumbing while trying to fix your trouble, you expect he is already an expert. Similarly, only when you developed your abilities will you generally get the freedom to practice your expertise, whatever you choose to make it, including the expertise of “universality” as I did. I have already discussed the gentle art of educating your bosses, so will not go into it again. It is part of the job of those who are going to rise to the top. Along the way you will generally have superiors who are less able than you are, so do not complain since how else could it be if you are going to end up at the top and they are not?\nFinally, I must address the topic of: is the effort required for excellent worth it? I believe it is—the chief gain is in the effort to change yourself, in the struggle with yourself, and it is less in the winning than you might expect. Yes, it is nice to end up where you wanted to be, but the person you are when you get there is far more important. I believe a life in which you do not try to extend yourself regularly is not worth living—but it is up to you to pick the goals you believe are worth striving for. As Socrates (470?-399) said,\n“The unexamined life is not worth living.”\nIn summary; as I claimed at the start, the essence of the book is “style”, and there is no real content in the form of the topics like coding theory, filter theory, or simulation that were used for examples. I repeat, the content of these chapters is “style” of thinking, which I have tried to exhibit in many forms. It is your problem to pick out those parts you can adapt to your life as you plan it to be. A plan for the future, I\nbelieve, is essential for success, otherwise you will drift like the drunken sailor through life and accomplish much less than you could otherwise have done.\nIn a sense, this has been a course a revivalist preacher might have given—repent you idle ways and in the future strive for greatness as you see it. I claim it is generally easier to succeed than it at first seems! It seems to me at almost all times there is a halo of opportunities about everyone from which to select. It is your life you have to live and I am only one of many possible guides you have for selecting and creating the style of the one life you have to live. Most of the things I have been saying were not said to me; I had to discover them for myself. I have now told you in some detail how to succeed, hence you have no excuse for not doing better than I did. Good Luck!";