const MACHINES = {
  neo_aim: {
    name: 'NEO AIMJUGGLER',
    bigBonus: 252,
    regBonus: 96,
    grapeCoins: 8,
    replayProb: 1 / 7.298,
    cherryCoef: 0.040403,
    settings: [
      { label: '1', prob: 1 / 6.02408 },
      { label: '2', prob: 1 / 6.02408 },
      { label: '3', prob: 1 / 6.02408 },
      { label: '4', prob: 1 / 6.02408 },
      { label: '5', prob: 1 / 6.02408 },
      { label: '6', prob: 1 / 5.84777 },
    ]
  },
  go_go: {
    name: 'GOGO JUGGLER 3',
    bigBonus: 240,
    regBonus: 96,
    grapeCoins: 8,
    replayProb: 1 / 7.298,
    cherryCoef: 0.037363,
    settings: [
      { label: '1', prob: 1 / 6.24986 },
      { label: '2', prob: 1 / 6.20019 },
      { label: '3', prob: 1 / 6.15015 },
      { label: '4', prob: 1 / 6.06983 },
      { label: '5', prob: 1 / 5.99982 },
      { label: '6', prob: 1 / 5.92014 },
    ]
  },
  my_jag: {
    name: 'MY JUGGLER 5',
    bigBonus: 240,
    regBonus: 96,
    grapeCoins: 8,
    replayProb: 1 / 7.298,
    cherryCoef: 0.042208,
    settings: [
      { label: '1', prob: 1 / 5.91000 },
      { label: '2', prob: 1 / 5.86977 },
      { label: '3', prob: 1 / 5.83009 },
      { label: '4', prob: 1 / 5.80016 },
      { label: '5', prob: 1 / 5.75989 },
      { label: '6', prob: 1 / 5.67019 },
    ]
  },
  mr_jag: {
    name: 'MR. JUGGLER',
    bigBonus: 240,
    regBonus: 96,
    grapeCoins: 8,
    replayProb: 1 / 7.298,
    cherryCoef: 0.079928,
    settings: [
      { label: '1', prob: 1 / 6.24212 },
      { label: '2', prob: 1 / 6.18381 },
      { label: '3', prob: 1 / 6.13690 },
      { label: '4', prob: 1 / 6.09807 },
      { label: '5', prob: 1 / 6.05973 },
      { label: '6', prob: 1 / 6.01689 },
    ]
  }
};

function calculate() {
  const totalGames = parseFloat(document.getElementById('totalGames').value);
  const diffCoins  = parseFloat(document.getElementById('diffCoins').value);
  const bigCount   = parseFloat(document.getElementById('bigCount').value);
  const regCount   = parseFloat(document.getElementById('regCount').value);

  const errEl = document.getElementById('errorMsg');
  errEl.classList.remove('show');

  if (isNaN(totalGames) || isNaN(diffCoins) || isNaN(bigCount) || isNaN(regCount)) {
    errEl.textContent = '全ての項目を入力してください';
    errEl.classList.add('show');
    document.getElementById('resultSection').classList.remove('show');
    return;
  }
  if (totalGames <= 0) {
    errEl.textContent = '総回転数は1以上を入力してください';
    errEl.classList.add('show');
    document.getElementById('resultSection').classList.remove('show');
    return;
  }

  localStorage.setItem('juggler_' + MACHINE_ID, JSON.stringify({ totalGames, diffCoins, bigCount, regCount }));

  const insert      = totalGames * 3;
  const totalPayout = insert + diffCoins;
  const bonusGain   = bigCount * machine.bigBonus + regCount * machine.regBonus;
  const replayGain  = (totalGames * machine.replayProb) * 3;
  const cherryGain  = totalGames * machine.cherryCoef;
  const grapeGain   = totalPayout - bonusGain - replayGain - cherryGain;

  if (grapeGain <= 0) {
    errEl.textContent = 'ブドウ獲得枚数が計算できませんでした。入力値を確認してください。';
    errEl.classList.add('show');
    document.getElementById('resultSection').classList.remove('show');
    return;
  }

  const grapeCount = grapeGain / machine.grapeCoins;
  const grapeRate  = totalGames / grapeCount;

  document.getElementById('grapeResult').textContent = '1/' + grapeRate.toFixed(2);
  document.getElementById('grapeRaw').textContent = '推定ブドウ回数: ' + Math.round(grapeCount) + '回';

  document.getElementById('d-insert').textContent    = Math.round(insert).toLocaleString() + '枚';
  document.getElementById('d-bonus').textContent     = Math.round(bonusGain).toLocaleString() + '枚';
  document.getElementById('d-yakuTotal').textContent = Math.round(totalPayout).toLocaleString() + '枚';
  document.getElementById('d-replay').textContent    = Math.round(replayGain).toLocaleString() + '枚';
  document.getElementById('d-cherry').textContent    = Math.round(cherryGain).toLocaleString() + '枚';
  document.getElementById('d-grape').textContent     = Math.round(grapeGain).toLocaleString() + '枚';

  buildTable(grapeRate);
  document.getElementById('resultSection').classList.add('show');
}

function buildTable(grapeRate) {
  const tbody = document.getElementById('settingTable');
  tbody.innerHTML = '';

  const calcProb = 1 / grapeRate;
  let closestIdx = 0;
  let minDiff = Infinity;
  machine.settings.forEach((s, i) => {
    const diff = Math.abs(s.prob - calcProb);
    if (diff < minDiff) { minDiff = diff; closestIdx = i; }
  });

  const probs = machine.settings.map(s => s.prob);
  const minP  = Math.min(...probs);
  const maxP  = Math.max(...probs);

  machine.settings.forEach((s, i) => {
    const tr = document.createElement('tr');
    if (i === closestIdx) tr.classList.add('is-closest');

    const pct = maxP === minP ? 60 : ((s.prob - minP) / (maxP - minP) * 55 + 25).toFixed(1);

    tr.innerHTML = `
      <td class="td-setting">設定${s.label}</td>
      <td class="td-prob">1/${(1 / s.prob).toFixed(3)}</td>
      <td class="td-bar"><div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div></td>
    `;
    tbody.appendChild(tr);
  });
}

function resetAll() {
  ['totalGames','diffCoins','bigCount','regCount'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('resultSection').classList.remove('show');
  document.getElementById('errorMsg').classList.remove('show');
  localStorage.removeItem('juggler_' + MACHINE_ID);
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('juggler_' + MACHINE_ID);
  if (!saved) return;
  try {
    const d = JSON.parse(saved);
    if (d.totalGames !== undefined) document.getElementById('totalGames').value = d.totalGames;
    if (d.diffCoins  !== undefined) document.getElementById('diffCoins').value  = d.diffCoins;
    if (d.bigCount   !== undefined) document.getElementById('bigCount').value   = d.bigCount;
    if (d.regCount   !== undefined) document.getElementById('regCount').value   = d.regCount;
    if (!isNaN(d.totalGames) && !isNaN(d.diffCoins) && !isNaN(d.bigCount) && !isNaN(d.regCount)) {
      calculate();
    }
  } catch(e) {}
});
