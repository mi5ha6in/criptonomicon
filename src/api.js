const API_KEY =
  "26198f2bc372a3f154628db7e0aeac6341481d9d30288e963d064064cc688406";

const tickersHandler = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const AGREGATE_INDEX = "5";

socket.addEventListener("message", e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
    e.data
  );

  if (type !== AGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandler.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subsctibeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

function unsubsctibeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  });
}

export const subscribeToticker = (ticker, cb) => {
  const subscribers = tickersHandler.get(ticker) || [];
  tickersHandler.set(ticker, [...subscribers, cb]);
  subsctibeToTickerOnWs(ticker);
};

export const unsubscribeFromToticker = ticker => {
  tickersHandler.delete(ticker);
  unsubsctibeToTickerOnWs(ticker);
};

window.tickers = tickersHandler;
