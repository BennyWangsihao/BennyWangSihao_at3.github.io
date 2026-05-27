/*
  This script controls the click interaction.
  Each button turns one generated sound on or off.
  The Web Audio API is used instead of downloaded audio files,
  which avoids copyright issues and keeps the prototype simple.
*/

const buttons = document.querySelectorAll(".seed");
const statusText = document.querySelector("#status");
const resetButton = document.querySelector("#reset");

let audio;
let sounds = {};

function startAudio() {
  if (!audio) {
    audio = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function makeTone(freq) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.value = 0.04;

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start();

  return {
    stop() {
      osc.stop();
    }
  };
}

function getFrequency(name) {
  if (name === "rain") return 180;
  if (name === "wind") return 240;
  if (name === "tone") return 110;
  if (name === "pulse") return 330;
  if (name === "night") return 90;
}

function updateStatus() {
  const active = Object.keys(sounds);

  if (active.length === 0) {
    statusText.textContent = "No sound layers active.";
    document.body.classList.remove("active");
  } else {
    statusText.textContent = "Active layers: " + active.join(", ");
    document.body.classList.add("active");
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    startAudio();

    const soundName = button.dataset.sound;

    if (sounds[soundName]) {
      sounds[soundName].stop();
      delete sounds[soundName];
      button.classList.remove("on");
    } else {
      sounds[soundName] = makeTone(getFrequency(soundName));
      button.classList.add("on");
    }

    updateStatus();
  });
});

resetButton.addEventListener("click", () => {
  Object.keys(sounds).forEach((name) => {
    sounds[name].stop();
  });

  sounds = {};

  buttons.forEach((button) => {
    button.classList.remove("on");
  });

  updateStatus();
});

updateStatus();