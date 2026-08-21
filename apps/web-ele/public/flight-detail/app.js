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

const detailParams = new URLSearchParams(window.location.search);
const timeLabel = value => value && value.length === 4 ? `${value.slice(0, 2)}:${value.slice(2)}` : value;
const dateLabel = value => {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return year && month && day ? `${String(day).padStart(2, '0')} ${months[month - 1]}` : value;
};

if (detailParams.get('from') && detailParams.get('to')) {
  const selectedLeg = tripLegs[1];
  selectedLeg.dep = detailParams.get('from');
  selectedLeg.arr = detailParams.get('to');
  selectedLeg.depDate = dateLabel(detailParams.get('date'));
  selectedLeg.arrDate = selectedLeg.depDate;
  selectedLeg.depLocal = timeLabel(detailParams.get('std'));
  selectedLeg.arrLocal = timeLabel(detailParams.get('sta'));
  selectedLeg.depUtc = selectedLeg.depLocal;
  selectedLeg.arrUtc = selectedLeg.arrLocal;

  const flightId = detailParams.get('flightId');
  const flightNo = detailParams.get('flightNo');
  const aircraft = detailParams.get('aircraft');
  const type = detailParams.get('type');
  const activeLegCard = document.querySelector('.leg-card[data-leg="1"]');
  if (activeLegCard) {
    activeLegCard.querySelector('b').textContent = `${selectedLeg.dep} → ${selectedLeg.arr}`;
    activeLegCard.querySelector('span').textContent = `${selectedLeg.depDate} · ${selectedLeg.depLocal}–${selectedLeg.arrLocal}`;
  }
  if (flightId) document.querySelector('.crumbs strong').textContent = flightId;
  if (flightNo) document.querySelector('#crumbLeg').textContent = flightNo;
  if (type) document.querySelector('.trip-type').textContent = type;
  if (aircraft) document.querySelector('.head-meta strong').textContent = `G650ER · ${aircraft}`;
}

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
document.querySelector('.back-btn').addEventListener('click', () => {
  if (window.parent !== window) window.parent.postMessage('flight-detail:back', window.location.origin);
  else window.history.back();
});

document.querySelector('#readinessList').innerHTML = readiness.map(([name, pct, icon, state]) =>
  `<div class="readiness-row ${state}"><b>${name}</b><span><i style="width:${pct}%"></i></span><em>${icon}</em></div>`
).join('');

function switchTab(id) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  const target = document.querySelector(`#${id}`);
  if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
}

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));
document.querySelectorAll('[data-jump]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.jump)));

const sectionObserver = new IntersectionObserver(entries => {
  const visibleSection = entries
    .filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visibleSection) return;
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === visibleSection.target.id);
  });
}, { rootMargin: '-74px 0px -58% 0px', threshold: [0.05, 0.2, 0.5] });

document.querySelectorAll('.tab-panel').forEach(panel => sectionObserver.observe(panel));

const timeToggle = document.querySelector('#timeToggle');
timeToggle.addEventListener('click', () => {
  showUtc = timeToggle.classList.toggle('utc');
  timeToggle.innerHTML = showUtc ? '<span>LT</span> UTC' : 'LT <span>UTC</span>';
  renderLeg(activeLeg);
});

renderLeg(activeLeg);

const exportMaterials = {
  'crew-trip-sheet': '机组行程清单',
  'passenger-itinerary': '乘客行程清单',
  'ciq-package': '三关文件',
  'flight-assignment': '飞行任务书',
  'dispatch-package': '航班放行资料包',
  'handling-sheet': '保障任务单',
};

function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function exportMaterial(key) {
  const title = exportMaterials[key];
  if (!title) return;
  const activeFlight = tripLegs[activeLeg];
  const content = [
    title,
    `航段：${activeFlight.dep} - ${activeFlight.arr}`,
    `日期：${activeFlight.depDate}`,
    `时间：${activeFlight.depLocal} - ${activeFlight.arrLocal}`,
    'Starjet SOC 航班运行中心生成',
  ].join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title}-${activeFlight.dep}-${activeFlight.arr}.txt`;
  document.body.append(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
  showToast(`${title}已生成并开始下载`);
}

document.querySelectorAll('[data-export]').forEach(button => {
  button.addEventListener('click', () => exportMaterial(button.dataset.export));
});

document.querySelector('[data-export-all]')?.addEventListener('click', () => {
  const keys = Object.keys(exportMaterials);
  keys.forEach((key, index) => setTimeout(() => exportMaterial(key), index * 120));
  showToast('全部物料已生成并开始下载');
});

document.querySelectorAll('.filters button').forEach(button => button.addEventListener('click', () => {
  button.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
}));
