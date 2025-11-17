import workEndUrl from '../../assets/workEnd.mp3';
import breakEndUrl from '../../assets/breakEnd.mp3';

const workEndSound = new Audio(workEndUrl);
const breakEndSound = new Audio(breakEndUrl);
workEndSound.volume = 0.3
breakEndSound.volume=1;

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
//sonido

//pedimos permiso al usuario para mostrar notificaciones
window.addEventListener('load', () => {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      console.log("Permiso de notificaciones:", permission);
    });
  }
});
function notifyModeChange(mode: "work" | "break") {
  if (Notification.permission === "granted") {
    new Notification("RecordPomoTime", {
      body: mode === "work" ? "Concentración: ¡manos a la obra!" : "Descanso: Tómate un respiro",
      icon: "./assets/notification-icon.png" // opcional, si tienes un icono
    });
  }
}


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

let isWaiting = false;

function switchMode() {
  isWaiting = true; // activamos espera
  if (mode === "work") {
    laps++;
    updateLaps();
    mode = "break";
    secondsLeft = breakTime;
    statusElement.textContent = "Descanso";
    breakEndSound.play();
  } else {
    mode = "work";
    secondsLeft = workTime;
    statusElement.textContent = "Concentración";
    workEndSound.play();
  }
  updateTimer();
  saveState();
  notifyModeChange(mode);
  // Espera de 2 segundos antes de continuar el conteo
  setTimeout(() => {
    isWaiting = false;
  }, 2000);
}

// Modifica el setInterval para respetar la espera
setInterval(() => {
  if (!isWaiting && isRunning && secondsLeft > 0) {
    secondsLeft--;
    updateTimer();
    saveState();
  } else if (!isWaiting && isRunning && secondsLeft === 0) {
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
  //updateLaps();
  saveState();
});
const resetAllBtn = document.getElementById("resetAllBtn")!;
resetAllBtn.addEventListener('click', () => {
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
// Botón hamburguesa
window.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }
});
