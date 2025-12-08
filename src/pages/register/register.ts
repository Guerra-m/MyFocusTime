import api from "../../api/api";

const form = document.querySelector("form") as HTMLFormElement;

// Creamos un elemento para mensajes
const msg = document.createElement("p");
msg.style.color = "green";
msg.style.display = "none";
form.appendChild(msg);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener valores del formulario
  const name = (document.getElementById("usuario") as HTMLInputElement).value.trim();
  const mail = (document.getElementById("email") as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value;
  const password2 = (document.getElementById("password2") as HTMLInputElement).value;

  // Validación de contraseñas
  if (password !== password2) {
    msg.textContent = "Las contraseñas no coinciden";
    msg.style.color = "red";
    msg.style.display = "block";
    return;
  }

  try {
    const body = { name, mail, password };

    // Llamada a la API usando tu api.ts
    await api.post("/usuarios/register", body);

    // Mostrar mensaje de éxito
    msg.textContent = "Registro exitoso. Redirigiendo al login...";
    msg.style.color = "green";
    msg.style.display = "block";

    // Esperamos 2 segundos antes de redirigir
    setTimeout(() => {
      window.location.href = "../login/login.html";
    }, 2000);

  } catch (err: any) {
    console.error(err);
    msg.textContent = err.message || "Error al registrar usuario";
    msg.style.color = "red";
    msg.style.display = "block";
  }
});
