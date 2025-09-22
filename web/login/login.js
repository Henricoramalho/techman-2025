const display = document.getElementById("display");
const buttons = document.querySelectorAll(".keypad button");
const sendBtn = document.getElementById("sendBtn");

let input = "";

// quando clica nos botões do teclado
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.textContent;

    if (value >= "0" && value <= "9") {
      if (input.length < 6) {
        input += value;
      }
    } 
    else if (btn.classList.contains("clear")) {
      input = "";
    } 
    else if (btn.classList.contains("backspace")) {
      input = input.slice(0, -1);
    }

    atualizarDisplay();
  });
});

// quando clica em Enviar
sendBtn.addEventListener("click", async () => {
  if (input.length === 6) {
    try {
      const response = await fetch("http://localhost:3000/usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ senha: input }) // 👈 ajusta conforme seu backend
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Login autorizado! Bem-vindo.");
        console.log("Resposta da API:", data);
        // Exemplo: redirecionar
        // window.location.href = "/home.html";
      } else {
        alert("❌ Senha incorreta!");
        console.error("Erro:", data);
      }
    } catch (err) {
      console.error("Erro de rede:", err);
      alert("Erro de conexão com o servidor.");
    }

    input = "";
    atualizarDisplay();
  } else {
    alert("Digite os 6 dígitos antes de enviar!");
  }
});

function atualizarDisplay() {
  if (input.length === 0) {
    display.textContent = "______";
  } else {
    let masked = "*".repeat(input.length - 1) + input.slice(-1);
    display.textContent = masked;
  }
}
