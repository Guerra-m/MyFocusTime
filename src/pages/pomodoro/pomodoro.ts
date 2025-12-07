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

// ---------- ESTADO ----------
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

// ---------- INIT ----------
window.addEventListener("DOMContentLoaded", () => {

  if ("Notification" in window) {
    Notification.requestPermission();
  }

  const saved = localStorage.getItem("pomodoroState");
  if (saved) {
    const st = JSON.parse(saved);
    secondsLeft = st.secondsLeft;
    isRunning = st.isRunning;
    laps = st.laps;
    mode = st.mode;
    statusElement.textContent = st.status;
  }

  updateTimer();
  updateLaps();
  updateHorasHoy();
  // --- BOTÓN HAMBURGUESA ---
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }
});

// ---------- TIMER ----------
function updateTimer() {
  const min = Math.floor(secondsLeft / 60);
  const sec = secondsLeft % 60;
  timerElement.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  document.title = `${timerElement.textContent} - ${mode === "work" ? "Concentración" : "Descanso"}`;
}

function updateLaps() {
  lapsElement.textContent = `Llevas ${laps} vueltas`;
  updateHorasHoy();
}

function saveState() {
  localStorage.setItem(
    "pomodoroState",
    JSON.stringify({ secondsLeft, isRunning, laps, mode, status: statusElement.textContent })
  );
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
  pauseBtn.textContent = isRunning ? "Pausa" : "Reanudar";
  saveState();
});

resetBtn.addEventListener("click", () => {
  laps = 0;
  mode = "work";
  secondsLeft = workTime;
  statusElement.textContent = "Concentración";
  updateTimer();
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

// ---------- CALCULAR HORAS HOY ----------
function updateHorasHoy() {
  const horasHoy = (laps * (workTime / 60)) / 60;
  document.getElementById("horasHoy")!.textContent =
    `Hoy llevas estudiando ${horasHoy.toFixed(2)} horas.`;
}

// ---------- UTIL ----------
function getHoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------- OBTENER REGISTRO HOY ----------
async function obtenerRegistroHoy() {
  const fecha = getHoyISO();
  console.log("Token actual:", localStorage.getItem("authToken"));

  const data = await api.get(`/tiempo/semanal?fecha=${fecha}`);
  return data.find((r: any) => r.fecha === fecha) || null;
}

// ---------- GUARDAR ----------
async function guardarEstudio() {
  const fecha = getHoyISO();
  const minutos = laps * 50;

  const hoyRegistro = await obtenerRegistroHoy();

  if (!hoyRegistro) {
    await api.post("/tiempo/crear", {
      fecha,
      minutosEstudiados: minutos
    });

    alert("Tiempo guardado ✔");

  } else {
    console.log("Token actual:", localStorage.getItem("authToken"));

    await api.put(`/tiempo/actualizar/${hoyRegistro.id}`, {
      fecha,
      minutosEstudiados: minutos
    });

    alert("Tiempo actualizado ✔");
  }
}

document.getElementById("guardarBtn")!.addEventListener("click", guardarEstudio);

// ---------- LOGOUT ----------
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  localStorage.removeItem("authToken");
  window.location.href = "../../pages/login/login.html";
});
