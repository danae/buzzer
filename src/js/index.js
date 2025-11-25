const $ = require('jquery');
const confetti = require('./confetti.js');

// Import styles
require('@fortawesome/fontawesome-free/js/all.js');


// The probability to have a correct buzzer (1 out of n)
const probability = 16;

// The icons to use for the buzzer
const buzzerIcon = 'fa-solid fa-land-mine-on';
const correctIcon = 'fa-solid fa-gift fa-beat';
const wrongIcon = 'fa-solid fa-sack-xmark fa-shake';
const probabilityIcons = ['fa-regular fa-circle', 'fa-solid fa-circle-half-stroke', 'fa-solid fa-circle'];

// The duration to hold the buzzed state (milliseconds)
const holdCorrectDuration = 4500;
const holdWrongDuration = 1500;


// Internal state
let _currentProbability = probability;
let _hasBuzzed = false;
let _isMuted = false;


// Check the probability
function checkProbability() {
  return Math.random() * _currentProbability < 1.0;
}

// Increase the probability
function increaseProbability() {
  _currentProbability = Math.max(1, _currentProbability - 1);
}

// Update the probability display
function updateProbabilityDisplay() {
  const steps = probability / 2;
  const exact = (probability - _currentProbability) * (steps / probability);
  const full = Math.floor(exact);
  const hasHalf = exact % 1 !== 0;

  const container = $('#probability');
  container.html('');

  for (let i = 0; i < steps; i ++)
    container.append($('<i>').addClass(probabilityIcons[i < full ? 2 : i === full && hasHalf ? 1 : 0]));
}

// Event handler when the document is loaded
$(function() {
  // Load the assets
  const correctAudio = document.querySelector('#correctAudio');
  const wrongAudio = document.querySelector('#wrongAudio');

  // Set the buzzer class
  $('#buzzer-icon').addClass(buzzerIcon);
  
  // Update the probability display
  updateProbabilityDisplay();

  // Event handler for when the buzzer is clicked
  $('#buzzer').on('click', function() {
    // Check if there already has been buzzed
    if (_hasBuzzed)
      return;

    // Set the buzzed state
    _hasBuzzed = true;

    // Determine if the buzzer was correct
    const isCorrect = checkProbability();
    if (isCorrect) {
      // Set the correct class
      $('#hero').addClass('is-success');
      $('#navbar').addClass('is-success');
      $('#buzzer-icon').removeClass(buzzerIcon).addClass(correctIcon);

      // Start the confetti
      confetti.startConfetti();
      setTimeout(() => confetti.stopConfetti(), 1250);

      // Play the correct audio
      correctAudio.play();

      // Reset the current probability
      _currentProbability = probability;
    } else {
      // Set the wrong class
      $('#hero').addClass('is-danger');
      $('#navbar').addClass('is-danger');
      $('#buzzer-icon').removeClass(buzzerIcon).addClass(wrongIcon);

      // Play the wrong audio
      wrongAudio.play();

      // Adjust the current probability
      increaseProbability();
    }

    console.log(_currentProbability);

    // Reset the buzzed state after the specified duration
    setTimeout(function() {
      // Reset the correct and wrong class
      $('#hero').removeClass('is-success is-danger');
      $('#navbar').removeClass('is-success is-danger');
      $('#buzzer-icon').removeClass(correctIcon).removeClass(wrongIcon).addClass(buzzerIcon);

      // Update the probability display
      updateProbabilityDisplay();

      // Reset the buzzed state
      _hasBuzzed = false;
    }.bind(this), isCorrect ? holdCorrectDuration : holdWrongDuration);
  })

  // Event handler when the mute button is clicked
  $('#mute').on('click', function() {
    // Check if currently muted
    if (!_isMuted) {
      // Set the muted state
      _isMuted = true;

      // Set the muted class
      $(this).find('i').removeClass('fa-volume-high').addClass('fa-volume-xmark');
    } else {
      // Reset the muted state
      _isMuted = false;

      // Reset the muted class
      $(this).find('i').removeClass('fa-volume-xmark').addClass('fa-volume-high');
    }

    // Mute or unmute the audio assets
    correctAudio.muted = _isMuted;
    wrongAudio.muted = _isMuted;
  })

  // Event handler when the full screen button is clicked
  $('#fullscreen').on('click', function() {
    // Check if something is full screen already
    if (document.fullscreenElement == null) {
      // Request the full screen
      document.body.requestFullscreen();

      // Set the full screen class
      $(this).find('i').removeClass('fa-expand').addClass('fa-compress');
    } else {
      // Exit the full screen
      document.exitFullscreen();

      // Reset the full screen class
      $(this).find('i').removeClass('fa-compress').addClass('fa-expand');
    }
  })
});