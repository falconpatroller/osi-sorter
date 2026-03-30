const layers = [
  { name: 'Physical', color: '#ef4d39' },
  { name: 'Data Link', color: '#2f83dd' },
  { name: 'Network', color: '#a899d8' },
  { name: 'Transport', color: '#71c0dc' },
  { name: 'Session', color: '#6fdc3f' },
  { name: 'Presentation', color: '#f2d126' },
  { name: 'Application', color: '#ff8a2b' }
];

const tray = document.getElementById('tray');
const slots = [...document.querySelectorAll('.slot')].sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
const statusText = document.getElementById('status-text');
const bulb = document.getElementById('bulb');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const appShell = document.querySelector('.app-shell');
const template = document.getElementById('brick-template');

let draggedBrick = null;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setBulb(state) {
  const states = {
    off: {
      src: 'assets/bulb-off.svg',
      alt: 'Status lightbulb currently off'
    },
    good: {
      src: 'assets/bulb-green.svg',
      alt: 'Status lightbulb glowing green'
    },
    bad: {
      src: 'assets/bulb-red.svg',
      alt: 'Status lightbulb glowing red'
    }
  };

  bulb.src = states[state].src;
  bulb.alt = states[state].alt;
}

function clearFeedback() {
  appShell.classList.remove('is-correct', 'is-incorrect');
  setBulb('off');
  statusText.textContent = 'Arrange the layers and press submit.';
}

function createBrick(layer) {
  const brick = template.content.firstElementChild.cloneNode(true);
  brick.dataset.layer = layer.name;
  brick.querySelector('.brick-label').textContent = layer.name;
  brick.style.background = `linear-gradient(180deg, ${layer.color}, ${layer.color})`;

  brick.addEventListener('dragstart', () => {
    draggedBrick = brick;
    brick.classList.add('dragging');
    clearFeedback();
  });

  brick.addEventListener('dragend', () => {
    brick.classList.remove('dragging');
    draggedBrick = null;
  });

  return brick;
}

function populateTray() {
  tray.innerHTML = '';
  slots.forEach((slot) => {
    slot.innerHTML = '';
  });

  shuffle(layers).forEach((layer) => {
    tray.appendChild(createBrick(layer));
  });
}

function enableDropzone(dropzone, options = {}) {
  const { singleBrick = false } = options;

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('drop-hover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drop-hover');
  });

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('drop-hover');

    if (!draggedBrick) {
      return;
    }

    if (singleBrick) {
      const existingBrick = dropzone.querySelector('.brick');
      if (existingBrick && existingBrick !== draggedBrick) {
        tray.appendChild(existingBrick);
      }
      dropzone.innerHTML = '';
      dropzone.appendChild(draggedBrick);
      return;
    }

    dropzone.appendChild(draggedBrick);
  });
}

function checkAnswer() {
  const currentOrder = slots.map((slot) => slot.querySelector('.brick')?.dataset.layer || null);
  const isComplete = currentOrder.every(Boolean);

  if (!isComplete) {
    appShell.classList.remove('is-correct');
    appShell.classList.add('is-incorrect');
    setBulb('bad');
    statusText.textContent = 'Not quite yet — every tower slot must contain a brick.';
    return;
  }

  const correctOrder = layers.map((layer) => layer.name);
  const isCorrect = currentOrder.every((layerName, index) => layerName === correctOrder[index]);

  if (isCorrect) {
    appShell.classList.remove('is-incorrect');
    appShell.classList.add('is-correct');
    setBulb('good');
    statusText.textContent = 'Correct! The OSI model is stacked in the right order from bottom to top.';
  } else {
    appShell.classList.remove('is-correct');
    appShell.classList.add('is-incorrect');
    setBulb('bad');
    statusText.textContent = 'Try again — one or more layers are out of order.';
  }
}

submitBtn.addEventListener('click', checkAnswer);
resetBtn.addEventListener('click', () => {
  clearFeedback();
  populateTray();
});

enableDropzone(tray, { singleBrick: false });
slots.forEach((slot) => enableDropzone(slot, { singleBrick: true }));
populateTray();
clearFeedback();
