const form = document.getElementById("loginForm") as HTMLFormElement;
const errorMsg = document.getElementById("errorMsg") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const mail = (document.getElementById("mail") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  try {
    const formData = new FormData();
    formData.append("mail", mail);
    formData.append("password", password);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/login`, {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Login incorrecto");
    }

    const usuario = await response.json();
    console.log("Usuario recibido:", usuario);
    localStorage.setItem("authToken", usuario.token); 
    localStorage.setItem("usuario", JSON.stringify(usuario));

    window.location.href = "../stats/semana.html";
  } catch (err) {
    console.error(err);
    errorMsg.style.display = "block";
  }
});
