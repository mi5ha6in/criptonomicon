const API_KEY =
  "26198f2bc372a3f154628db7e0aeac6341481d9d30288e963d064064cc688406";

const tickersHandler = new Map();

const loadTickers = () => {
  if (tickersHandler.size === 0) {
    return;
  }
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandler.keys()
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(respons => respons.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandler.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
};

export const subscribeToticker = (ticker, cb) => {
  const subscribers = tickersHandler.get(ticker) || [];
  tickersHandler.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromToticker = ticker => {
  tickersHandler.delete(ticker);
};

setInterval(loadTickers, 5000);
window.tickers = tickersHandler;
