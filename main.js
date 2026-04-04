const STORAGE_KEY = "lucky-pick-history";
const MAX_HISTORY = 5;

const drawButton = document.querySelector("#draw-button");
const redrawButton = document.querySelector("#redraw-button");
const clearHistoryButton = document.querySelector("#clear-history-button");
const drawTitle = document.querySelector("#draw-title");
const drawCount = document.querySelector("#draw-count");
const lastDrawTime = document.querySelector("#last-draw-time");
const numberBalls = document.querySelector("#number-balls");
const bonusBall = document.querySelector("#bonus-ball");
const historyList = document.querySelector("#history-list");

const history = loadHistory();
let totalDraws = history.length;

function pickNumbers() {
  const pool = Array.from({ length: 45 }, (_, index) => index + 1);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  const numbers = pool.slice(0, 6).sort((left, right) => left - right);
  const bonus = pool[6];

  return { numbers, bonus };
}

function getBallClass(number) {
  if (number <= 10) {
    return "range-1";
  }

  if (number <= 20) {
    return "range-2";
  }

  if (number <= 30) {
    return "range-3";
  }

  if (number <= 40) {
    return "range-4";
  }

  return "range-5";
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(timestamp);
}

function saveHistory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function renderCurrentDraw(draw) {
  numberBalls.innerHTML = "";

  draw.numbers.forEach((number, index) => {
    const ball = document.createElement("div");
    ball.className = `number-ball ${getBallClass(number)}`;
    ball.style.animationDelay = `${index * 70}ms`;
    ball.textContent = number;
    numberBalls.append(ball);
  });

  bonusBall.className = `bonus-ball ${getBallClass(draw.bonus)}`;
  bonusBall.textContent = draw.bonus;
  drawTitle.textContent = draw.numbers.join(" · ");
  lastDrawTime.textContent = formatTime(draw.timestamp);
  drawCount.textContent = `총 ${totalDraws}회 추첨`;
}

function renderHistory() {
  historyList.innerHTML = "";

  if (!history.length) {
    const emptyState = document.createElement("li");
    emptyState.className = "history-empty";
    emptyState.textContent = "아직 저장된 추첨 결과가 없습니다.";
    historyList.append(emptyState);
    return;
  }

  history.forEach((draw, index) => {
    const item = document.createElement("li");
    item.className = "history-item";

    const top = document.createElement("div");
    top.className = "history-top";
    top.innerHTML = `<span>${index + 1}번째 기록</span><span>${formatTime(draw.timestamp)}</span>`;

    const balls = document.createElement("div");
    balls.className = "history-balls";

    [...draw.numbers, draw.bonus].forEach((number, numberIndex) => {
      const ball = document.createElement("div");
      ball.className = `history-ball ${getBallClass(number)}`;
      ball.textContent = number;

      if (numberIndex === draw.numbers.length) {
        ball.title = "보너스 번호";
      }

      balls.append(ball);
    });

    item.append(top, balls);
    historyList.append(item);
  });
}

function runDraw() {
  const draw = {
    ...pickNumbers(),
    timestamp: Date.now(),
  };

  totalDraws += 1;
  history.unshift(draw);
  history.splice(MAX_HISTORY);
  saveHistory(history);
  renderCurrentDraw(draw);
  renderHistory();
}

function clearHistory() {
  history.length = 0;
  totalDraws = 0;
  localStorage.removeItem(STORAGE_KEY);
  numberBalls.innerHTML = "";
  bonusBall.className = "bonus-ball";
  bonusBall.textContent = "?";
  drawTitle.textContent = "버튼을 눌러 추첨하세요";
  lastDrawTime.textContent = "기록 없음";
  drawCount.textContent = "총 0회 추첨";
  renderHistory();
}

drawButton.addEventListener("click", runDraw);
redrawButton.addEventListener("click", runDraw);
clearHistoryButton.addEventListener("click", clearHistory);

renderHistory();

if (history.length) {
  renderCurrentDraw(history[0]);
}
