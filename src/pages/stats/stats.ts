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

// Consumir API
const API_URL = "http://localhost:8080/tiempo";

// Usuario logueado
const usuarioId = 1;

// Fecha de hoy en formato YYYY-MM-DD
const hoy = new Date().toISOString().split("T")[0];
// const hoy = "2025-12-04";

// ----------------------------------------------------------
//     CALCULAR HORAS TOTALES DE LA SEMANA (YA LO TENÍAS)
// ----------------------------------------------------------

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
  } catch (error) {
    console.error("Error obteniendo horas de la semana:", error);
    return 0;
  }
}

// ----------------------------------------------------------
//                📅 CALENDARIO SEMANAL AQUÍ
// ----------------------------------------------------------

// Devuelve lunes → domingo de la semana de "fecha"
function getWeekDays(fecha: Date): Date[] {
  const day = fecha.getDay(); // 0=Domingo, 1=Lunes...
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(fecha);
  monday.setDate(fecha.getDate() - diffToMonday);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

// Llamar a la API para obtener los registros diarios
async function fetchSemana(): Promise<any[]> {
  const resp = await fetch(`${API_URL}/semanal/${usuarioId}?fecha=${hoy}`);
  if (!resp.ok) throw new Error("Error en API");
  return await resp.json();
}

// Renderizar calendario semanal
async function renderWeekCalendar() {
  const weekDays = getWeekDays(new Date());
  const data = await fetchSemana();

  // preparar mapa: fecha → minutos
  const minutesByDate: Record<string, number> = {};
  data.forEach(reg => {
    minutesByDate[reg.fecha] = (minutesByDate[reg.fecha] || 0) + reg.minutosEstudiados;
  });

  const container = document.getElementById("calendarWeek");
  if (!container) return;

  container.innerHTML = ""; // limpiar

  weekDays.forEach(day => {
    const iso = day.toISOString().split("T")[0];
    const min = minutesByDate[iso] || 0;
    const h = (min / 60).toFixed(1);

    const div = document.createElement("div");
    div.className = "calendar-day";
    div.innerHTML = `
      <div class="date">${iso}</div>
      <div class="hours">${h} h</div>
    `;
    container.appendChild(div);
  });
}

// ----------------------------------------------------------
//            DETECTAR SI ESTAMOS EN semana.html
// ----------------------------------------------------------

if (window.location.pathname.endsWith("semana.html")) {
  // horas totales arriba
  fetchHorasSemana().then(horas => {
    document.getElementById("horasSemana")!.innerText =
      `Has estudiado ${horas} horas esta semana.`;
  });

  // calendario semanal
  renderWeekCalendar();
}
