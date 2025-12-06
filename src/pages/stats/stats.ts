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

//Consumir api
const API_URL = "http://localhost:8080/tiempo";

// Cambia esto por el usuario logueado
const usuarioId = 1;

// Genera automáticamente la fecha de hoy en formato YYYY-MM-DD
//const hoy = new Date().toISOString().split("T")[0];
const hoy = "2025-12-04";

async function fetchHorasSemana(): Promise<number> {
    try {
        const response = await fetch(`${API_URL}/semanal/${usuarioId}?fecha=${hoy}`);
        if (!response.ok) throw new Error("Error en la API");

        const data = await response.json();

        // data es un array → sumamos minutos
        const totalMinutos = data.reduce(
            (acc: number, registro: any) => acc + registro.minutosEstudiados,
            0
        );

        // Convertir minutos → horas
        const horas = totalMinutos / 60;

        // 1 decimal
        return Number(horas.toFixed(1));

    } catch (error) {
        console.error("Error obteniendo horas de la semana:", error);
        return 0;
    }
}

// Detectamos si estamos en semana.html
if (window.location.pathname.endsWith("semana.html")) {
    fetchHorasSemana().then(horas => {
        document.getElementById("horasSemana")!.innerText =
            `Has estudiado ${horas} horas esta semana.`;
    });
}
