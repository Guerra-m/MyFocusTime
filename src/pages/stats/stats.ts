// Botón hamburguesa
window.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }
});


// ------------------ OBTENER USUARIO LOGUEADO ------------------
const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

// si no hay usuario → ir al login
if (!usuario || !usuario.id) {
  window.location.href = "../../pages/login/login.html";
}

// --------------------------------------------------------------
function getHoyISO() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// API
const API_URL = `${import.meta.env.VITE_API_URL}/tiempo`;
const hoy = getHoyISO();

// ------------------- HORAS SEMANA ----------------------
async function fetchHorasSemana(): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/semanal?fecha=${hoy}`, {
      credentials: "include"
    });
    if (!response.ok) throw new Error("Error en la API");

    const data = await response.json();
    const totalMinutos = data.reduce(
      (acc: number, registro: any) => acc + registro.minutosEstudiados,
      0
    );

    return Number((totalMinutos / 60).toFixed(1));
  } catch (err) {
    console.error(err);
    return 0;
  }
}

function toISOlocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ------------------- CALENDARIO SEMANA --------------------
async function renderSemana() {
  const response = await fetch(`${API_URL}/semanal?fecha=${hoy}`, {
    credentials: "include"
  });
  if (!response.ok) {
    console.error("Error al cargar registros de la semana");
    return;
  }

  const registros = await response.json();

  const hoyDate = new Date(hoy);
  const diaSemana = hoyDate.getDay();
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoyDate);
  lunes.setDate(hoyDate.getDate() + offset);

  const opcionesMes = { month: "long" } as const;
  const mesNombre = lunes.toLocaleDateString("es-ES", opcionesMes);
  const year = lunes.getFullYear();

  document.getElementById("tituloSemana")!.innerText =
    `${mesNombre.toUpperCase()} ${year}`;

  const contenedor = document.getElementById("calendarWeek")!;
  contenedor.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + i);

    const fechaISO = toISOlocal(dia);
    const registro = registros.find((r: any) => r.fecha === fechaISO);
    const minutos = registro ? registro.minutosEstudiados : 0;
    const horas = (minutos / 60).toFixed(1);

    const div = document.createElement("div");
    div.classList.add("calendar-day");

    div.innerHTML = `
      <div class="date">${dia.getDate()}</div>
      <div class="hours">${horas}h</div>
    `;

    contenedor.appendChild(div);
  }
}

// ----------------------- INICIO --------------------------
if (window.location.pathname.endsWith("semana.html")) {
  fetchHorasSemana().then(h =>
    (document.getElementById("horasSemana")!.innerText =
      `Has estudiado ${h} horas esta semana.`)
  );

  renderSemana();
}

// ----------------------- LOGOUT --------------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    window.location.href = "../../pages/login/login.html";
  });
}
