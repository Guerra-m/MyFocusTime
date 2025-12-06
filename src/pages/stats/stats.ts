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

// API
const API_URL = "http://localhost:8080/tiempo";
const usuarioId = 1;
const hoy = new Date().toISOString().split("T")[0];
// ------------------- HORAS SEMANA ----------------------

async function fetchHorasSemana(): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/semanal/${usuarioId}?fecha=${hoy}`);
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

// ------------------- CALENDARIO SEMANA --------------------

async function renderSemana() {
  const response = await fetch(`${API_URL}/semanal/${usuarioId}?fecha=${hoy}`);
  const registros = await response.json();

  // obtener lunes
  const hoyDate = new Date(hoy);
  const diaSemana = hoyDate.getDay();
  const offset = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoyDate);
  lunes.setDate(hoyDate.getDate() + offset);

  // ---------------- TITULO GRANDE (Mes y año) ----------------
  const opcionesMes = { month: "long" } as const;
  const mesNombre = lunes.toLocaleDateString("es-ES", opcionesMes);
  const year = lunes.getFullYear();

  document.getElementById("tituloSemana")!.innerText =
    `${mesNombre.toUpperCase()} ${year}`;

  // contenedor
  const contenedor = document.getElementById("calendarWeek")!;
  contenedor.innerHTML = "";

  // crear días
  for (let i = 0; i < 7; i++) {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + i);

    const fechaISO = dia.toISOString().split("T")[0];
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
