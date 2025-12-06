
const API_URL = import.meta.env.VITE_API_URL + "/usuarios/login";

const form = document.getElementById("loginForm") as HTMLFormElement;
const errorMsg = document.getElementById("errorMsg") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mail = (document.getElementById("mail") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  try {
    const url = `${API_URL}?mail=${encodeURIComponent(mail)}&password=${encodeURIComponent(password)}`;

    const response = await fetch(url, {
      method: "POST", 
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Login incorrecto");
    }

    const usuario = await response.json();

    localStorage.setItem("usuario", JSON.stringify(usuario));

    window.location.href = "../stats/semana.html";
  } catch (err) {
    console.error(err);
    errorMsg.style.display = "block";
  }
});
