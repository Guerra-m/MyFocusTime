import api from "../../api/api";
import workEndUrl from "../../assets/workEnd.mp3";
import breakEndUrl from "../../assets/breakEnd.mp3";

// ---------- VALIDAR LOGIN ----------
const token = localStorage.getItem("authToken");
if (!token) {
  window.location.href = "../../pages/login/login.html";
}

// ---------- SONIDOS ----------
const workEndSound = new Audio(workEndUrl);
const breakEndSound = new Audio(breakEndUrl);
workEndSound.volume = 0.3;
breakEndSound.volume = 1;

// ---------- SETTINGS ----------
function getWorkTime() {
  return Number(localStorage.getItem("focusTime") ?? "25") * 60;
}

function getBreakTime() {
  return Number(localStorage.getItem("breakTime") ?? "5") * 60;
}

// ---------- ESTADO ----------
let workTime = getWorkTime();
let breakTime = getBreakTime();
let secondsLeft = workTime;
let isRunning = false;
let mode: "work" | "break" = "work";
let laps = 0;

const timerElement = document.getElementById("timer")!;
const pauseBtn = document.getElementById("pauseBtn")!;
const lapsElement = document.getElementById("laps")!;
const resetBtn = document.getElementById("resetBtn")!;
const skipBtn = document.getElementById("skipBtn")!;
const statusElement = document.getElementById("status")!;
pauseBtn.textContent = "Iniciar";


// ---------- INIT ----------
window.addEventListener("DOMContentLoaded", () => {

  if ("Notification" in window) {
    Notification.requestPermission();
  }

  // Releer settings actuales
  workTime = getWorkTime();
  breakTime = getBreakTime();

  // Reset automático si cambió el focusTime
  const lastFocusUsed = localStorage.getItem("lastFocusUsed");
  const currentFocus = localStorage.getItem("focusTime") ?? "25";

  if (lastFocusUsed !== currentFocus) {
    laps = 0;
    mode = "work";
    secondsLeft = workTime;
    localStorage.removeItem("pomodoroState");
  }

  localStorage.setItem("lastFocusUsed", currentFocus);

  // Restaurar estado
  const saved = localStorage.getItem("pomodoroState");
  if (saved) {
  const st = JSON.parse(saved);
  secondsLeft = st.secondsLeft;
  laps = st.laps;
  mode = st.mode;
  statusElement.textContent = st.status;
}

// SIEMPRE empezar pausado
isRunning = false;
pauseBtn.textContent = "Iniciar";


  // Clamp de seguridad
  if (mode === "work" && secondsLeft > workTime) secondsLeft = workTime;
  if (mode === "break" && secondsLeft > breakTime) secondsLeft = breakTime;

  updateTimer();
  updateLaps();
  updateHorasHoy();

  // Botón hamburguesa
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  menuToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("collapsed");
  });
});

// ---------- TIMER ----------
function updateTimer() {
  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;
  timerElement.textContent =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  document.title =
    `${timerElement.textContent} - ${mode === "work" ? "Concentración" : "Descanso"}`;
}

function updateLaps() {
  lapsElement.textContent = `Llevas ${laps} vueltas`;
  updateHorasHoy();
}

function saveState() {
  localStorage.setItem("pomodoroState", JSON.stringify({
    secondsLeft,
    isRunning,
    laps,
    mode,
    status: statusElement.textContent
  }));
}

let isWaiting = false;

function switchMode() {
  isWaiting = true;

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
  setTimeout(() => (isWaiting = false), 2000);
}

// ---------- LOOP ----------
setInterval(() => {
  if (!isWaiting && isRunning && secondsLeft > 0) {
    secondsLeft--;
    updateTimer();
    saveState();
  } else if (!isWaiting && isRunning && secondsLeft === 0) {
    switchMode();
  }
}, 1000);

// ---------- BOTONES ----------
pauseBtn.addEventListener("click", () => {
  isRunning = !isRunning;
  pauseBtn.textContent = isRunning ? "Pausa" : "Iniciar";
  updateHorasHoy();
  saveState();
});

resetBtn.addEventListener("click", () => {
  laps = 0;
  mode = "work";
  secondsLeft = workTime;
  isRunning = false;
  pauseBtn.textContent = "Iniciar";
  statusElement.textContent = "Concentración";
  updateTimer();
  updateLaps();
  saveState();
});



document.getElementById("resetAllBtn")!.addEventListener("click", () => {
  laps = 0;
  mode = "work";
  secondsLeft = workTime;
  updateTimer();
  updateLaps();
  saveState();
});

skipBtn.addEventListener("click", switchMode);

// ---------- HORAS HOY ----------
function updateHorasHoy() {
  const minutosPorVueltas = laps * (workTime / 60);

  let minutosParciales = 0;
  if (mode === "work" && isRunning) {
  minutosParciales = getMinutosParcialesVisibles();
}


  const totalHoras = (minutosPorVueltas + minutosParciales) / 60;
  document.getElementById("horasHoy")!.textContent =
    `Hoy llevas estudiando ${totalHoras.toFixed(2)} horas.`;
}

// ---------- UTIL ----------
function getHoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMinutosParcialesVisibles() {
  const texto = timerElement.textContent!;
  const [min, sec] = texto.split(":").map(Number);
  const restante = min * 60 + sec;
  const trabajado = workTime - restante;
  return trabajado > 0 ? trabajado / 60 : 0;
}

// ---------- API ----------
async function obtenerRegistroHoy() {
  const fecha = getHoyISO();
  const data = await api.get(`/tiempo/semanal?fecha=${fecha}`);
  return data.find((r: any) => r.fecha === fecha) || null;
}

async function guardarEstudio() {
  const fecha = getHoyISO();

  const minutos =
    Math.floor(laps * (workTime / 60) + getMinutosParcialesVisibles());

  const hoyRegistro = await obtenerRegistroHoy();

  if (!hoyRegistro) {
    await api.post("/tiempo/crear", { fecha, minutosEstudiados: minutos });
    alert("Tiempo guardado ✔");
  } else {
    await api.put(`/tiempo/actualizar/${hoyRegistro.id}`, {
      fecha,
      minutosEstudiados: minutos
    });
    alert("Tiempo actualizado ✔");
  }
}

document.getElementById("guardarBtn")!
  .addEventListener("click", guardarEstudio);

// ---------- LOGOUT ----------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "../../pages/login/login.html";
});
