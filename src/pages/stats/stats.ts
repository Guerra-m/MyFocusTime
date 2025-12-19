import api from "../../api/api";

// ------------------ BOTÓN HAMBURGUESA ------------------

window.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");

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

// ------------------ UTIL: FECHA A ISO ------------------

function toISOlocal(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ------------------ CALCULAR HORAS DE UNA SEMANA ------------------

async function fetchHorasDeSemana(fechaInicioISO: string): Promise<number> {
  try {
    const registros = await api.get(`/tiempo/semanal?fecha=${fechaInicioISO}`);

    const totalMinutos = registros.reduce(
      (acc: number, reg: any) => acc + reg.minutosEstudiados,
      0
    );

    return Number((totalMinutos / 60).toFixed(1));
  } catch (err) {
    console.error(err);
    return 0;
  }
}

// ------------------ NAVEGACIÓN ENTRE SEMANAS ------------------

let semanaOffset = 0;
// 0 = semana actual
// -1 = semana anterior
// +1 = semana siguiente

// ------------------ RENDER SEMANA COMPLETA ------------------

async function renderSemana() {

  // Hoy
  const [y, m, d] = hoy.split("-").map(Number);
  const hoyDate = new Date(y, m - 1, d);

  // Obtener día de la semana (convertimos domingo=7)
  let diaSemana = hoyDate.getDay();
  if (diaSemana === 0) diaSemana = 7;

  // Lunes de la semana actual
  const inicio = new Date(hoyDate);
  inicio.setDate(hoyDate.getDate() - (diaSemana - 1));

  // Aplicar desplazamiento de semanas
  inicio.setDate(inicio.getDate() + semanaOffset * 7);

  // Lunes en ISO
  const fechaInicioISO = toISOlocal(inicio);

  // Obtener registros de esta semana navegada
  const registros = await api.get(`/tiempo/semanal?fecha=${fechaInicioISO}`);

  // HORAS TOTALES
  const horasSemana = await fetchHorasDeSemana(fechaInicioISO);
  document.getElementById("horasSemana")!.innerText =
    `Has estudiado ${horasSemana} horas esta semana.`;

  // TITULO (MES + AÑO)
  const mesNombre = inicio.toLocaleDateString("es-ES", { month: "long" });
  const year = inicio.getFullYear();
  document.getElementById("tituloSemana")!.innerText =
    `${mesNombre.toUpperCase()} ${year}`;

  // RENDER DÍAS
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

  if (minutos > 0) {
    div.classList.add("has-hours");
  }

  if (fechaISO === hoy) {
    div.classList.add("today");
  }

  div.innerHTML = `
    <div class="date">${dia.getDate()}</div>
    <div class="hours">${horas}h</div>
  `;

  contenedor.appendChild(div);
}

}

// ------------------ INICIO ------------------

if (window.location.pathname.endsWith("semana.html")) {
  renderSemana();
}

// ------------------ BOTONES ANTERIOR / SIGUIENTE ------------------

document.getElementById("semanaAnterior")?.addEventListener("click", () => {
  semanaOffset -= 1;
  renderSemana();
});

document.getElementById("semanaSiguiente")?.addEventListener("click", () => {
  semanaOffset += 1;
  renderSemana();
});

// ------------------ LOGOUT ------------------

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("usuario");
  localStorage.removeItem("authToken");
  window.location.href = "../../pages/login/login.html";
});


//mes.html
let mesOffset = 0;
async function renderMes() {
  const hoyDate = new Date();
  hoyDate.setMonth(hoyDate.getMonth() + mesOffset);

  const year = hoyDate.getFullYear();
  const month = hoyDate.getMonth();

  const primerDia = new Date(year, month, 1);

  const fechaISO = `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const registros = await api.get(`/tiempo/mensual?fecha=${fechaISO}`

  );

  document.getElementById("tituloMes")!.innerText =
    primerDia
      .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
      .toUpperCase();

  // Lunes inicial del calendario
  let inicio = new Date(primerDia);
  let diaSemana = inicio.getDay();
  if (diaSemana === 0) diaSemana = 7;
  inicio.setDate(inicio.getDate() - (diaSemana - 1));

  const contenedor = document.getElementById("calendarMonth")!;
  contenedor.innerHTML = "";

  let totalMinutos = 0;

  for (let i = 0; i < 42; i++) {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);

    const fechaDiaISO = toISOlocal(dia);
    const registro = registros.find((r: any) => r.fecha === fechaDiaISO);

    const minutos = registro ? registro.minutosEstudiados : 0;
    totalMinutos += minutos;

    const div = document.createElement("div");
    div.classList.add("calendar-day");

    if (dia.getMonth() !== month) {
      div.classList.add("out-month");
    }
    const hoyISO = getHoyISO();

if (fechaDiaISO === hoyISO) {
  div.classList.add("today");
}
if (minutos > 0) {
  div.classList.add("has-hours");
}


    div.innerHTML = `
      <div class="date">${dia.getDate()}</div>
      <div class="hours">${(minutos / 60).toFixed(1)}h</div>
    `;

    contenedor.appendChild(div);
  }

  document.getElementById("horasMes")!.innerText =
    `Has estudiado ${(totalMinutos / 60).toFixed(1)} horas este mes.`;
}

if (window.location.pathname.endsWith("mes.html")) {
  renderMes();
}
document.getElementById("mesAnterior")?.addEventListener("click", () => {
  mesOffset--;
  renderMes();
});

document.getElementById("mesSiguiente")?.addEventListener("click", () => {
  mesOffset++;
  renderMes();
});
// ------------------ AÑO ------------------

let anioOffset = 0;

async function renderAnio() {
  const hoy = new Date();
  const year = hoy.getFullYear() + anioOffset;

  document.getElementById("tituloAnio")!.innerText = `AÑO ${year}`;

  const fechaISO = `${year}-01-01`;
  const registros = await api.get(`/tiempo/anual?fecha=${fechaISO}`);

  const contenedor = document.getElementById("calendarYear")!;
  contenedor.innerHTML = "";

  let totalMinutos = 0;

  for (let mes = 0; mes < 12; mes++) {
    const registrosMes = registros.filter((r: any) => {
      const fecha = new Date(r.fecha);
      return fecha.getMonth() === mes;
    });

    const minutosMes = registrosMes.reduce(
      (acc: number, r: any) => acc + r.minutosEstudiados,
      0
    );

    totalMinutos += minutosMes;

    const div = document.createElement("div");
    div.classList.add("month-card");

    if (minutosMes > 0) {
      div.classList.add("has-hours");
    }

    const nombreMes = new Date(year, mes, 1)
      .toLocaleDateString("es-ES", { month: "long" });

    div.innerHTML = `
      <div class="month-name">${nombreMes.toUpperCase()}</div>
      <div class="month-hours">${(minutosMes / 60).toFixed(1)}h</div>
    `;

    contenedor.appendChild(div);
  }

  document.getElementById("horasAnio")!.innerText =
    `Has estudiado ${(totalMinutos / 60).toFixed(1)} horas este año.`;
}

if (window.location.pathname.endsWith("anio.html")) {
  renderAnio();
}

document.getElementById("anioAnterior")?.addEventListener("click", () => {
  anioOffset--;
  renderAnio();
});

document.getElementById("anioSiguiente")?.addEventListener("click", () => {
  anioOffset++;
  renderAnio();
});
