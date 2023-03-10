import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat-container");

let loadInterval;

//to display loading
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

//to display ai generated text with better ux
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

//to generate unique id for each ai message
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//to differenciate user and ai message
function chatStrip(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img src=${isAi ? bot : user} alt=${isAi ? "bot" : "user"} />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //for user chatstripe
  chatContainer.innerHTML += chatStrip(false, data.get("prompt"));
  form.reset();

  //for ai chatstripe
  const uniqueId = generateUniqueId();

  chatContainer.innerHTML += chatStrip(true, "", uniqueId);

  //to scroll down the screen automatically to be able to see the message.
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  //fetch data from server to get bot response
  const response = await fetch("https://code-bot-server.onrender.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

//when the from is submit
form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  //13 means Enter key.
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

//to auto focus bot message
if (chatContainer) {
  chatContainer.addEventListener(
    "DOMNodeInserted",
    (event) => {
      const { currentTarget: target } = event;
      target.scroll({ top: target.scrollHeight, behavior: "smooth" });
    },
    true
  );
}
