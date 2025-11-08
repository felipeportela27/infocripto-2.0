// ================================
//  NAVIGAÇÃO ENTRE TELAS
// ================================
const navButtons = document.querySelectorAll(".nav-btn");
const screens = document.querySelectorAll("section");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    navButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    screens.forEach((s) => s.classList.remove("active"));
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

// ================================
//  MENU DO USUÁRIO
// ================================
const userIcon = document.getElementById("user-icon");
const dropdown = document.getElementById("user-dropdown");

userIcon.addEventListener("click", () => {
  dropdown.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!userIcon.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  dropdown.classList.remove("show");
  // Logout do Firebase
  await auth.signOut();
  window.location.href = 'index.html';
});

// ================================
//  CONVERSOR DE CRIPTOMOEDAS
// ================================
const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const resultDiv = document.getElementById("converter-result");

const API_KEY = "INSIRA_SUA_KEY_AQUI"; // substitua pela sua
const API_URL = "https://min-api.cryptocompare.com/data/price";

async function getPriceUSD(symbol) {
  try {
    const response = await fetch(`${API_URL}?fsym=${symbol}&tsyms=USD&api_key=${API_KEY}`);
    const data = await response.json();
    return data.USD;
  } catch (error) {
    console.error("Erro ao buscar preço:", error);
    return null;
  }
}

// ================================
//  GPU.js - Inicialização segura
// ================================
let gpu = null;

function initializeGPU() {
  try {
    if (typeof GPU !== "undefined") {
      gpu = new GPU({ mode: "gpu" }); // força WebGL
      console.log("✅ GPU.js inicializado com GPU!");
    }
  } catch (err) {
    console.warn("⚠️ GPU.js não pôde inicializar, usando CPU:", err);
    gpu = null;
  }
}

initializeGPU();

// ================================
//  FUNÇÃO DE CONVERSÃO
// ================================
async function convert() {
  const amount = parseFloat(amountInput.value);
  const from = fromCurrencySelect.value;
  const to = toCurrencySelect.value;

  if (!amount || amount <= 0) {
    resultDiv.textContent = "Digite uma quantidade válida.";
    return;
  }

  const [priceFrom, priceTo] = await Promise.all([getPriceUSD(from), getPriceUSD(to)]);

  if (priceFrom && priceTo) {
    let result;

    if (gpu) {
      try {
        const convertKernel = gpu.createKernel(function (amount, rateFrom, rateTo) {
          return amount * (rateFrom / rateTo);
        }).setOutput([1]);

        result = convertKernel(amount, priceFrom, priceTo)[0];
      } catch (error) {
        console.error("Erro ao usar GPU, revertendo para CPU:", error);
        result = amount * (priceFrom / priceTo);
      }
    } else {
      result = amount * (priceFrom / priceTo);
      console.info("⚡ Conversão usando CPU.");
    }

    resultDiv.textContent = `${amount} ${from} = ${result.toFixed(6)} ${to}`;
  } else {
    resultDiv.textContent = "Erro ao obter preços. Tente novamente.";
  }
}

amountInput.addEventListener("input", convert);
fromCurrencySelect.addEventListener("change", convert);
toCurrencySelect.addEventListener("change", convert);

// ================================
//  TABELA DE PREÇOS EM TEMPO REAL
// ================================
async function loadCryptoTable() {
  const symbols = ["BTC","ETH","USDT","XRP","LTC"];
  const tbody = document.querySelector("#crypto-table tbody");
  tbody.innerHTML = "";

  for (const sym of symbols) {
    try {
      const res = await fetch(`${API_URL}?fsym=${sym}&tsyms=USD&api_key=${API_KEY}`);
      const data = await res.json();
      const price = data.USD;
      const change24h = (Math.random() * 10 - 5).toFixed(2); // exemplo

      const row = `
        <tr>
          <td>${sym}</td>
          <td>$${price}</td>
          <td class="${change24h>=0?'positive':'negative'}">${change24h}%</td>
          <td>${new Date().toLocaleTimeString()}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    } catch (err) {
      console.error(`Erro ao carregar ${sym}:`, err);
    }
  }
}

setInterval(loadCryptoTable, 10000);
loadCryptoTable();
convert();


// ================================
//  NOTÍCIAS DE CRIPTOMOEDAS
// ================================
async function carregarNoticias() {
  const container = document.getElementById("news-container");
  if (!container) return;

  container.innerHTML = "<p>📰 Carregando notícias...</p>";

  try {
    const res = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=PT");
    const data = await res.json();

    if (!data.Data || data.Data.length === 0) {
      container.innerHTML = "<p>Nenhuma notícia encontrada.</p>";
      return;
    }

    container.innerHTML = data.Data.slice(0, 6)
      .map(
        (n) => `
        <div class="news-card">
          <img src="${n.imageurl}" alt="Notícia" class="news-img">
          <div class="news-content">
            <h3>${n.title}</h3>
            <p>${n.body.substring(0, 120)}...</p>
            <a href="${n.url}" target="_blank" class="news-link">Ler mais</a>
            <p class="news-date">${new Date(n.published_on * 1000).toLocaleString()}</p>
          </div>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Erro ao carregar notícias:", error);
    container.innerHTML = "<p>Erro ao carregar notícias. Tente novamente mais tarde.</p>";
  }
}

// Atualiza a cada 2 minutos
setInterval(carregarNoticias, 120000);
carregarNoticias();
