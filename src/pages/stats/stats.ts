import api from "../../api/api";

// ------------------ BOTÓN HAMBURGUESA ------------------

window.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }
});

// ------------------ VALIDAR LOGIN ------------------

const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

if (!usuario || !usuario.token) {
  window.location.href = "../../pages/login/login.html";
}

// ------------------ FECHA HOY ISO ------------------

function getHoyISO(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
}

const hoy = getHoyISO();

// ------------------ CALCULAR HORAS SEMANA ------------------

async function fetchHorasSemana(): Promise<number> {
  try {

    const data = await api.get(`/tiempo/semanal?fecha=${hoy}`);

    const totalMinutos = data.reduce(
      (acc: number, reg: any) => acc + reg.minutosEstudiados,
      0
    );

    return Number((totalMinutos / 60).toFixed(1));
  } catch (err) {
    console.error(err);
    return 0;
  }
}

function toISOlocal(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ------------------ RENDER SEMANA ------------------

async function renderSemana() {

  const registros = await api.get(`/tiempo/semanal?fecha=${hoy}`);

  const [y, m, d] = hoy.split("-").map(Number);
  const hoyDate = new Date(y, m - 1, d); // FECHA LOCAL REAL
  let diaSemana = hoyDate.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

  // -------------------------
  // 🔥 Forzar que la semana inicie en Lunes
  // -------------------------

  // Ajustar domingo (0) para que quede al final de la semana
  if (diaSemana === 0) diaSemana = 7;

  // Calcular el lunes de la semana actual
  const inicio = new Date(hoyDate);
  inicio.setDate(hoyDate.getDate() - (diaSemana - 1));

  // -------------------------
  // TÍTULO (MES + AÑO)
  // -------------------------

  const mesNombre = inicio.toLocaleDateString("es-ES", { month: "long" });
  const year = inicio.getFullYear();

  document.getElementById("tituloSemana")!.innerText =
    `${mesNombre.toUpperCase()} ${year}`;

  // -------------------------
  // RENDER DE LUNES → DOMINGO
  // -------------------------

  const contenedor = document.getElementById("calendarWeek")!;
  contenedor.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);

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




// ------------------ INICIO ------------------

if (window.location.pathname.endsWith("semana.html")) {
  fetchHorasSemana().then(h => {
    document.getElementById("horasSemana")!.innerText =
      `Has estudiado ${h} horas esta semana.`;
  });

  renderSemana();
}

// ------------------ LOGOUT ------------------

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  localStorage.removeItem("authToken");
  window.location.href = "../../pages/login/login.html";
});
