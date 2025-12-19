const DEFAULT_FOCUS = 25;
const DEFAULT_BREAK = 5;

const focusInput = document.getElementById("focusTime") as HTMLInputElement;
const breakInput = document.getElementById("breakTime") as HTMLInputElement;
const msg = document.getElementById("settingsMsg")!;

// Cargar valores
focusInput.value = localStorage.getItem("focusTime") ?? String(DEFAULT_FOCUS);
breakInput.value = localStorage.getItem("breakTime") ?? String(DEFAULT_BREAK);

// Guardar foco
document.getElementById("saveFocus")!.addEventListener("click", () => {
  const value = Number(focusInput.value);

  if (value <= 0) {
    msg.textContent = "El tiempo de foco debe ser mayor a 0";
    msg.style.color = "red";
    return;
  }

  localStorage.setItem("focusTime", String(value));
  msg.textContent = "Tiempo de foco guardado ✔";
  msg.style.color = "#4caf50";
});

// Guardar descanso
document.getElementById("saveBreak")!.addEventListener("click", () => {
  const value = Number(breakInput.value);

  if (value <= 0) {
    msg.textContent = "El tiempo de descanso debe ser mayor a 0";
    msg.style.color = "red";
    return;
  }

  localStorage.setItem("breakTime", String(value));
  msg.textContent = "Tiempo de descanso guardado ✔";
  msg.style.color = "#4caf50";
});
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

menuToggle?.addEventListener("click", () => {
  sidebar?.classList.toggle("collapsed");
});
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  localStorage.removeItem("authToken");
  window.location.href = "../../pages/login/login.html";
})