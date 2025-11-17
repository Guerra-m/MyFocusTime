let workTime = 50 * 60;
let breakTime = 10 * 60;
let secondsLeft = workTime;
let isRunning = true;
let mode: "work" | "break" = "work";
let laps = 0;

const timerElement = document.getElementById("timer")!;
const pauseBtn = document.getElementById("pauseBtn")!;
const lapsElement = document.getElementById("laps")!;
const resetBtn = document.getElementById("resetBtn")!;
const skipBtn = document.getElementById("skipBtn")!;
const statusElement = document.getElementById("status")!;

// Al cargar la página
window.addEventListener('load', () => {
  const savedState = localStorage.getItem('pomodoroState');
  if (savedState) {
    const state = JSON.parse(savedState);
    secondsLeft = state.secondsLeft;
    isRunning = state.isRunning;
    laps = state.laps;
    mode = state.mode;
    statusElement.textContent = state.status;
  }
  updateTimer();
  updateLaps();
});

// Funciones de timer
function updateTimer() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  timerElement.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
  document.title = `${timerElement.textContent} - ${mode === "work" ? "Concentración" : "Descanso"}`;
}

function updateLaps() {
  lapsElement.textContent = `Llevas ${laps} vueltas`;
}

function switchMode() {
  if (mode === "work") {
    laps++;
    updateLaps();
    mode = "break";
    secondsLeft = breakTime;
    statusElement.textContent = "Descanso";
  } else {
    mode = "work";
    secondsLeft = workTime;
    statusElement.textContent = "Concentración";
  }
  saveState();
  updateTimer();
}

// Intervalo de 1s
setInterval(() => {
  if (isRunning && secondsLeft > 0) {
    secondsLeft--;
    updateTimer();
    saveState();
  } else if (isRunning && secondsLeft === 0) {
    switchMode();
  }
}, 1000);

// Botones
pauseBtn.addEventListener('click', () => {
  isRunning = !isRunning;
  pauseBtn.textContent = isRunning ? "Pausa" : "Reanudar";
  saveState();
});

resetBtn.addEventListener('click', () => {
  laps = 0;
  mode = "work";
  secondsLeft = workTime;
  statusElement.textContent = "Concentración";
  updateTimer();
  updateLaps();
  saveState();
});

skipBtn.addEventListener('click', () => {
  switchMode();
});

// Guardar en localStorage
function saveState() {
  const state = { secondsLeft, isRunning, laps, mode, status: statusElement.textContent };
  localStorage.setItem('pomodoroState', JSON.stringify(state));
}
