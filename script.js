/*
  This script controls the click interaction.
  Each image button turns one generated sound on or off.
  The Web Audio API creates simple tones, so no external audio files are needed.
*/

const buttons = document.querySelectorAll(".seed");
const statusText = document.querySelector("#status");
const resetButton = document.querySelector("#reset");

let audioContext;
let activeSounds = {};

function startAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function makeTone(frequency) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.04;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();

  return {
    stop() {
      oscillator.stop();
    }
  };
}

function getFrequency(soundName) {
  if (soundName === "rain") return 180;
  if (soundName === "wind") return 240;
  if (soundName === "tone") return 110;
  if (soundName === "pulse") return 330;
  if (soundName === "night") return 90;
}

function updateStatus() {
  const activeNames = Object.keys(activeSounds);

  if (activeNames.length === 0) {
    statusText.textContent = "No sound layers active.";
    document.body.classList.remove("active");
  } else {
    statusText.textContent = "Active layers: " + activeNames.join(", ");
    document.body.classList.add("active");
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    startAudio();

    const soundName = button.dataset.sound;

    if (activeSounds[soundName]) {
      activeSounds[soundName].stop();
      delete activeSounds[soundName];
      button.classList.remove("on");
    } else {
      activeSounds[soundName] = makeTone(getFrequency(soundName));
      button.classList.add("on");
    }

    updateStatus();
  });
});

resetButton.addEventListener("click", () => {
  Object.keys(activeSounds).forEach((soundName) => {
    activeSounds[soundName].stop();
  });

  activeSounds = {};

  buttons.forEach((button) => {
    button.classList.remove("on");
  });

  updateStatus();
});

updateStatus();