document.addEventListener('DOMContentLoaded', () => {
  // ----------------- Navegação -----------------
  const navButtons = document.querySelectorAll('nav .nav-btn');
  const sections = document.querySelectorAll('main section');

  function updateAriaSelected(activeBtn) {
    navButtons.forEach(btn => {
      btn.setAttribute('aria-selected', btn === activeBtn ? 'true' : 'false');
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateAriaSelected(btn);

      const targetId = btn.getAttribute('data-target');
      sections.forEach(s => {
        s.classList.toggle('active', s.id === targetId);
      });

      const activeSection = document.getElementById(targetId);
      if (activeSection) activeSection.focus();
    });
  });

  // ----------------- Conversor -----------------
  const amountInput = document.getElementById('amount');
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');
  const resultDiv = document.getElementById('converter-result');

  // Função para pegar preço atual de uma moeda em USD via CoinGecko
  async function getPriceUSD(coinId) {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
      const data = await res.json();
      return data[coinId]?.usd || null;
    } catch (err) {
      console.error('Erro ao obter preço:', err);
      return null;
    }
  }

  // Mapeamento das moedas para IDs da CoinGecko
  const coinMap = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'USDT': 'tether',
    'XRP': 'ripple',
    'LTC': 'litecoin'
  };

  async function convertCurrency(amount, from, to) {
    if (from === to) return amount;

    const fromPrice = await getPriceUSD(coinMap[from]);
    const toPrice = await getPriceUSD(coinMap[to]);

    if (!fromPrice || !toPrice) return null;

    const usdAmount = amount * fromPrice;
    return usdAmount / toPrice;
  }

  async function updateConversion() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;

    if (!amount || amount <= 0) {
      resultDiv.textContent = 'Digite uma quantidade válida.';
      return;
    }

    resultDiv.textContent = 'Calculando...';
    const converted = await convertCurrency(amount, from, to);

    if (converted === null) {
      resultDiv.textContent = `Não foi possível converter de ${from} para ${to}.`;
      return;
    }

    resultDiv.textContent = `${amount.toLocaleString('pt-BR')} ${from} equivalem a ${converted.toFixed(8)} ${to}`;
  }

  amountInput.addEventListener('input', updateConversion);
  fromCurrencySelect.addEventListener('change', updateConversion);
  toCurrencySelect.addEventListener('change', updateConversion);
  updateConversion();

  // ----------------- Preços em Tempo Real -----------------
  const cryptoTableBody = document.querySelector('#crypto-table tbody');
  const cryptosToShow = ['bitcoin','ethereum','tether','ripple','litecoin'];

  async function updateCryptoPrices() {
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptosToShow.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
      const data = await res.json();

      cryptoTableBody.innerHTML = '';
      data.forEach(coin => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${coin.name} (${coin.symbol.toUpperCase()})</td>
          <td>$${coin.current_price.toLocaleString()}</td>
          <td class="${coin.price_change_percentage_24h >=0 ? 'positive' : 'negative'}">
            ${coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2)+'%' : 'N/A'}
          </td>
          <td>${new Date(coin.last_updated).toLocaleTimeString('pt-BR')}</td>
        `;
        cryptoTableBody.appendChild(tr);
      });
    } catch {
      cryptoTableBody.innerHTML = '<tr><td colspan="4">Erro ao carregar dados em tempo real.</td></tr>';
    }
  }

  updateCryptoPrices();
  setInterval(updateCryptoPrices, 60000);

  // ----------------- User Menu -----------------
  const userIcon = document.getElementById('user-icon');
  const userDropdown = document.getElementById('user-dropdown');
  const logoutBtn = document.getElementById('logout-btn');

  if (userIcon && userDropdown && logoutBtn) {
    userIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      userDropdown.style.display = 'none';
    });

    logoutBtn.addEventListener('click', () => {
      userDropdown.style.display = 'none';
      window.location.href = 'index.html';
    });
  }
});
