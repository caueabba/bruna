document.addEventListener("DOMContentLoaded", function () {
  emailjs.init("J0p9lqwNj9ggAV5hM"); // Seu Public Key do EmailJS

  const inputBox = document.getElementById("user-input");
  let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

  inputBox.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

  function sendMessage() {
    const userInput = inputBox.value.trim();
    if (userInput === "") return;

    addMessage("Você: " + userInput, "text-primary font-weight-bold");
    chatHistory.push({ sender: "Você", message: userInput });

    const botResponse = getBotResponse(userInput);

    // Se for orçamento, ativa modo de espera para detalhes
    if (botResponse.includes("Digite em poucas palavras o que você precisa")) {
      window.localStorage.setItem("awaitingDetails", "true");
      addMessage("Chatbot: " + botResponse, "text-secondary");
      chatHistory.push({ sender: "Chatbot", message: botResponse });
    }
    // Se já estiver esperando detalhes, salva e finaliza
    else if (window.localStorage.getItem("awaitingDetails") === "true") {
      sendEmail(userInput);
      addMessage(
        "Chatbot: Obrigado! A designer entrará em contato em breve. 😊",
        "text-success"
      );
      chatHistory.push({
        sender: "Chatbot",
        message: "Obrigado! A designer entrará em contato em breve. 😊",
      });

      // Remove o modo de espera para evitar respostas extras
      window.localStorage.removeItem("awaitingDetails");
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      return; // Finaliza a função, impedindo resposta "Não entendi"
    }
    // Se não for orçamento, segue com a conversa normal
    else {
      addMessage("Chatbot: " + botResponse, "text-secondary");
      chatHistory.push({ sender: "Chatbot", message: botResponse });
    }

    // Atualiza o armazenamento local da conversa
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

    inputBox.value = "";
    document.getElementById("chat-messages").scrollTop =
      document.getElementById("chat-messages").scrollHeight;
  }

  function sendEmail(details) {
    const templateParams = {
      from_name: "Cliente via Chatbot",
      message: details,
      to_email: "brunafoltran@gmail.com",
    };

    emailjs
      .send("service_vdkkre4", "template_j7edpi9", templateParams)
      .then(() => console.log("E-mail enviado com sucesso"))
      .catch((error) => console.error("Erro ao enviar e-mail:", error));
  }

  function addMessage(message, className) {
    const messageDiv = document.createElement("div");
    className.split(" ").forEach((cls) => messageDiv.classList.add(cls));
    messageDiv.textContent = message;
    const chatMessages = document.getElementById("chat-messages");
    if (chatMessages) {
      chatMessages.appendChild(messageDiv);
    } else {
      console.error("Elemento 'chat-messages' não encontrado.");
    }
  }

  function getBotResponse(input) {
    input = input.toLowerCase();

    if (
      input.includes("olá") ||
      input.includes("ola") ||
      input.includes("oie") ||
      input.includes("oi")
    )
      return "Olá! Como posso te ajudar?";
    if (
      input.includes("orçamento") ||
      input.includes("orcamento") ||
      input.includes("orçar") ||
      input.includes("orcar") ||
      input.includes("preço") ||
      input.includes("preco") ||
      input.includes("valores")
    ) {
      return "Claro! Digite em poucas palavras o que você precisa. Ou então envie um email com todas as informações para brunafoltran@gmail.com";
    }
    if (
      input.includes("contato") ||
      input.includes("telefone") ||
      input.includes("email") ||
      input.includes("e-mail") ||
      input.includes("bruna")
    )
      return "Você pode entrar em contato pelo e-mail brunafoltran@gmail.com ou pelo Telefone/WhatsApp (11) 99999-9999.";
    if (input.includes("tchau")) return "Até mais! 😊";
    if (input.includes("obrigado"))
      return "Eu que agradeço! Em breve entrarei em contato, até mais! 😊";

    return "Não entendi, poderia reformular?";
  }
});

function exportChatHistory() {
  const chatHistory = localStorage.getItem("chatHistory");
  if (!chatHistory) {
    console.error("Nenhum histórico encontrado!");
    return;
  }

  const blob = new Blob([chatHistory], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat-history.json";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}