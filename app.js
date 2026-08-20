const readiness = [
  ['飞机 Aircraft', 100, '✓', 'ready'], ['机组 Crew', 100, '✓', 'ready'],
  ['旅客 Passenger', 78, '!', 'warning'], ['地面保障 Handling', 100, '✓', 'ready'],
  ['燃油 Fuel', 100, '✓', 'ready'], ['许可 Permit', 62, '✕', 'blocking'],
  ['时刻 Slot', 100, '✓', 'ready'], ['文件 Documents', 75, '!', 'warning']
];

const tripLegs = [
  { dep:'ZBAA', depName:'北京首都 · PEK', depDate:'20 AUG', depLocal:'06:00', depUtc:'22:00', arr:'RJTT', arrName:'东京羽田 · HND', arrDate:'20 AUG', arrLocal:'10:20', arrUtc:'01:20', duration:'3H 20M', distance:'4,621 KM · IFR' },
  { dep:'RJTT', depName:'东京羽田 · HND', depDate:'20 AUG', depLocal:'14:20', depUtc:'05:20', arr:'WSSS', arrName:'新加坡樟宜 · SIN', arrDate:'20 AUG', arrLocal:'20:35', arrUtc:'12:35', duration:'7H 15M', distance:'5,315 KM · IFR' },
  { dep:'WSSS', depName:'新加坡樟宜 · SIN', depDate:'22 AUG', depLocal:'09:00', depUtc:'01:00', arr:'ZBAA', arrName:'北京首都 · PEK', arrDate:'22 AUG', arrLocal:'15:10', arrUtc:'07:10', duration:'6H 10M', distance:'4,460 KM · IFR' }
];
let activeLeg = 1;
let showUtc = false;

function renderLeg(index) {
  activeLeg = index;
  const leg = tripLegs[index];
  document.querySelector('#depCode').textContent = leg.dep;
  document.querySelector('#depName').textContent = leg.depName;
  document.querySelector('#arrCode').textContent = leg.arr;
  document.querySelector('#arrName').textContent = leg.arrName;
  document.querySelector('#flightDuration').textContent = leg.duration;
  document.querySelector('#flightDistance').textContent = leg.distance;
  document.querySelector('#depTime').innerHTML = `${leg.depDate}&nbsp; ${showUtc ? leg.depUtc : leg.depLocal} <small>${showUtc ? 'UTC' : 'LT'}</small>`;
  document.querySelector('#arrTime').innerHTML = `${leg.arrDate}&nbsp; ${showUtc ? leg.arrUtc : leg.arrLocal} <small>${showUtc ? 'UTC' : 'LT'}</small>`;
  document.querySelector('#crumbLeg').textContent = `航班 ${index + 1}`;
  document.querySelector('#legNumber').textContent = index + 1;
  document.querySelectorAll('.leg-card').forEach((card, cardIndex) => {
    card.classList.toggle('active', cardIndex === index);
    if (cardIndex === index) card.setAttribute('aria-current', 'true'); else card.removeAttribute('aria-current');
  });
  document.querySelector('#prevLeg').disabled = index === 0;
  document.querySelector('#nextLeg').disabled = index === tripLegs.length - 1;
}

document.querySelectorAll('.leg-card').forEach(card => card.addEventListener('click', () => renderLeg(Number(card.dataset.leg))));
document.querySelector('#prevLeg').addEventListener('click', () => renderLeg(activeLeg - 1));
document.querySelector('#nextLeg').addEventListener('click', () => renderLeg(activeLeg + 1));

document.querySelector('#readinessList').innerHTML = readiness.map(([name, pct, icon, state]) =>
  `<div class="readiness-row ${state}"><b>${name}</b><span><i style="width:${pct}%"></i></span><em>${icon}</em></div>`
).join('');

function switchTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === id));
  document.querySelector('.content').scrollIntoView({behavior:'smooth', block:'start'});
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.jump)));

const timeToggle = document.querySelector('#timeToggle');
timeToggle.addEventListener('click', () => {
  showUtc = timeToggle.classList.toggle('utc');
  timeToggle.innerHTML = showUtc ? '<span>LT</span> UTC' : 'LT <span>UTC</span>';
  renderLeg(activeLeg);
});

renderLeg(activeLeg);

const dialog = document.querySelector('#taskDialog');
const addTask = document.querySelector('#addTask');
if (addTask) addTask.addEventListener('click', () => dialog.showModal());
document.querySelector('#saveTask').addEventListener('click', (event) => {
  const name = document.querySelector('#taskName').value.trim();
  if (!name) return;
  event.preventDefault();
  const row = document.createElement('div');
  row.className = 'task-row';
  row.innerHTML = `<input type="checkbox"><span><b>${name.replace(/[<>]/g,'')}</b><small>Operations</small></span><span>运行控制</span><span>今日 16:30</span><span class="priority normal">NORMAL</span><span class="status">TO DO</span>`;
  document.querySelector('#taskList').append(row);
  dialog.close();
  document.querySelector('#taskName').value = '';
  const toast = document.querySelector('#toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
});

document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => {
  button.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
}));
