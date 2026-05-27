/* 
  Echo Bloom - JavaScript Interaction Notes

  This JavaScript file controls the main click interaction. The assignment asks for a
  prototype based around one browser action, so I intentionally keep the interaction
  focused on clicking. Each click toggles one sound layer on or off. This creates a
  clear cause-and-effect relationship: the user clicks a seed, the visual state changes,
  the text updates, and the audio layer starts or stops.

  I use the Web Audio API instead of imported music files. This is useful for this
  academic prototype because it avoids copyright problems. The brief warns that linked
  media does not automatically grant permission, so generating simple tones and noise
  directly in code is a safer choice. The sounds are not meant to be professional music.
  They are simple placeholders that demonstrate how the interaction could work in a
  larger relaxation or study tool.

  The browser normally blocks audio until the user interacts with the page. This could
  be a challenge in some projects, but here it actually supports the design because the
  first click is meant to begin the experience. The audio context is created only after
  a user click. This respects browser rules and keeps the prototype from making sound
  unexpectedly when the page loads.

  The sound design is intentionally subtle. Rain, wind and night use filtered noise.
  Deep Tone and Soft Pulse use oscillators. The gain values are low so that multiple
  active layers do not become too harsh. If this prototype became a larger project,
  the next step would be adding better sound mixing, volume sliders and possibly
  recorded Creative Commons audio with correct attribution.

  The interface also includes a reset button. This gives the user a simple way to
  return the system to silence. That is important in a relaxation context because the
  user should always feel in control. The activeSounds object stores which sound layers
  are currently playing. When a seed is clicked, the script checks whether that sound
  already exists. If it exists, the script stops it. If not, the script creates it.

  This code is original and does not use external JavaScript libraries. The structure is
  deliberately readable so that the interaction design can be explained clearly during
  the Week 11 presentation.
*/

const seeds = document.querySelectorAll(".seed");
const resetButton = document.querySelector("#resetButton");
const statusText = document.querySelector("#statusText");

let audioContext;
let activeSounds = {};

function startAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function createNoiseBuffer() {
  const bufferSize = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function createFilteredNoise(type, frequency, volume) {
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  source.buffer = createNoiseBuffer();
  source.loop = true;

  filter.type = type;
  filter.frequency.value = frequency;

  gain.gain.value = volume;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);

  source.start();

  return {
    source: source,
    gain: gain,
    stop: function () {
      gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
      setTimeout(() => {
        source.stop();
      }, 250);
    }
  };
}

function createTone(frequency, type, volume) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();

  return {
    source: oscillator,
    gain: gain,
    stop: function () {
      gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
      setTimeout(() => {
        oscillator.stop();
      }, 250);
    }
  };
}

function createPulse() {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const pulseLfo = audioContext.createOscillator();
  const pulseGain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 220;

  pulseLfo.type = "sine";
  pulseLfo.frequency.value = 1.2;

  pulseGain.gain.value = 0.035;
  gain.gain.value = 0.03;

  pulseLfo.connect(pulseGain);
  pulseGain.connect(gain.gain);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  pulseLfo.start();

  return {
    source: oscillator,
    lfo: pulseLfo,
    gain: gain,
    stop: function () {
      gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
      setTimeout(() => {
        oscillator.stop();
        pulseLfo.stop();
      }, 250);
    }
  };
}

function createSound(soundName) {
  if (soundName === "rain") {
    return createFilteredNoise("lowpass", 900, 0.035);
  }

  if (soundName === "wind") {
    return createFilteredNoise("bandpass", 500, 0.03);
  }

  if (soundName === "tone") {
    return createTone(110, "sine", 0.045);
  }

  if (soundName === "pulse") {
    return createPulse();
  }

  if (soundName === "night") {
    return createFilteredNoise("lowpass", 250, 0.025);
  }
}

function formatSoundName(soundName) {
  const names = {
    rain: "Rain",
    wind: "Wind",
    tone: "Deep Tone",
    pulse: "Soft Pulse",
    night: "Night"
  };

  return names[soundName];
}

function updateStatus() {
  const activeNames = Object.keys(activeSounds).map(formatSoundName);

  if (activeNames.length === 0) {
    statusText.textContent = "No sound layers active yet.";
    document.body.classList.remove("sound-active");
  } else {
    statusText.textContent = "Active layers: " + activeNames.join(" + ");
    document.body.classList.add("sound-active");
  }
}

function toggleSound(seed) {
  startAudioContext();

  const soundName = seed.dataset.sound;

  if (activeSounds[soundName]) {
    activeSounds[soundName].stop();
    delete activeSounds[soundName];
    seed.classList.remove("active");
  } else {
    activeSounds[soundName] = createSound(soundName);
    seed.classList.add("active");
  }

  updateStatus();
}

function resetSoundscape() {
  Object.keys(activeSounds).forEach((soundName) => {
    activeSounds[soundName].stop();
  });

  activeSounds = {};

  seeds.forEach((seed) => {
    seed.classList.remove("active");
  });

  updateStatus();
}

seeds.forEach((seed) => {
  seed.addEventListener("click", () => {
    toggleSound(seed);
  });
});

resetButton.addEventListener("click", resetSoundscape);

updateStatus();