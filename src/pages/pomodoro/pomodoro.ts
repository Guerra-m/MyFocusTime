let workTime = 50 * 60;
let breakTime = 10 * 60;

let time = workTime;
let isPaused = false;
let mode: "work" | "break" = "work";
let laps = 0;

const timerElement = document.getElementById("timer")!;
const pauseBtn = document.getElementById("pauseBtn")!;
const lapsElement = document.getElementById("laps")!;
const resetBtn = document.getElementById("resetBtn")!;
const skipBtn = document.getElementById("skipBtn")!;
const statusElement = document.getElementById("status")!;

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

function updateTimer() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  const formattedTime =
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  timerElement.textContent = formattedTime;

  document.title = `${formattedTime} - ${
    mode === "work" ? "Concentración" : "Descanso"
  }`;
}

function updateLaps() {
  lapsElement.textContent = `Llevas ${laps} vueltas`;
}

function switchMode() {
  if (mode === "work") {
    laps++;
    updateLaps();
    mode = "break";
    time = breakTime;
    statusElement.textContent = "Descanso";
  } else {
    mode = "work";
    time = workTime;
    statusElement.textContent = "Concentración";
  }

  updateTimer();
}

setInterval(() => {
  if (!isPaused && time > 0) {
    time--;
    updateTimer();
  } else if (!isPaused && time === 0) {
    switchMode();
  }
}, 1000);

pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Reanudar" : "Pausa";
});

resetBtn.addEventListener("click", () => {
  laps = 0;
  updateLaps();

  mode = "work";
  time = workTime;
  updateTimer();
});

skipBtn.addEventListener("click", () => {
  switchMode();
});
