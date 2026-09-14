const questions = [
  {
    text: 'Matahari terbit dari arah timur.',
    answer: 'fact',
    explanation:
      'Bumi berputar dari barat ke timur. Akibatnya, Matahari tampak terbit dari arah timur.',
  },
  {
    text: 'Es krim cokelat lebih enak daripada es krim vanila.',
    answer: 'opinion',
  },
  {
    text: 'Satu jam terdiri dari 60 menit.',
    answer: 'fact',
    explanation:
      'Dalam satuan waktu, satu jam sama dengan 60 menit. Nilai ini merupakan ukuran yang baku.',
  },
  {
    text: 'Belajar sambil mendengarkan musik lebih menyenangkan.',
    answer: 'opinion',
  },
  {
    text: 'Segitiga memiliki tiga sisi.',
    answer: 'fact',
    explanation:
      'Segitiga adalah bangun datar yang memiliki tiga sisi dan tiga sudut. Ini adalah sifat dasar segitiga.',
  },
  { text: 'Pantai adalah tempat terbaik untuk berlibur.', answer: 'opinion' },
  {
    text: 'Bumi mengelilingi Matahari.',
    answer: 'fact',
    explanation:
      'Bumi bergerak mengelilingi Matahari dalam orbitnya. Satu putaran memerlukan waktu sekitar 365¼ hari.',
  },
  { text: 'Film komedi lebih menarik daripada film aksi.', answer: 'opinion' },
  {
    text: 'Manusia menggunakan paru-paru untuk bernapas.',
    answer: 'fact',
    explanation:
      'Paru-paru merupakan organ pernapasan manusia. Di dalamnya terjadi pertukaran oksigen dan karbon dioksida.',
  },
  { text: 'Warna ungu adalah warna yang paling indah.', answer: 'opinion' },
];

const $ = (selector) => document.querySelector(selector);
const card = $('#question-card');
const dialog = $('#feedback');
let current = 0;
let score = 0;
let answered = false;
let drag = null;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.hidden = screen.id !== id;
  });
}

function resetCard() {
  drag = null;
  card.classList.remove('dragging');
  card.style.transform = '';
  card.style.opacity = '';
  $('#swipe-label').style.opacity = '0';
}

async function swipeCard(choice) {
  const startTransform = getComputedStyle(card).transform;
  const pointerId = drag?.id;
  drag = null;
  card.classList.remove('dragging');
  if (pointerId !== undefined && card.hasPointerCapture(pointerId)) {
    card.releasePointerCapture(pointerId);
  }

  const direction = choice === 'opinion' ? -1 : 1;
  const distance = $('.game').clientWidth + card.clientHeight;
  const endTransform = `translateX(${direction * distance}px) rotate(${direction * 25}deg)`;
  card.style.transform = endTransform;
  card.style.opacity = '0';

  const animation = card.animate(
    [
      { transform: startTransform, opacity: 1 },
      { transform: endTransform, opacity: 0 },
    ],
    {
      duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350,
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
    }
  );
  await animation.finished;
}

function renderQuestion() {
  answered = false;
  resetCard();
  const number = String(current + 1).padStart(2, '0');
  $('#question-number').textContent = number;
  $('#card-number').textContent = number;
  $('#question-text').textContent = questions[current].text;
  const nextQuestion = questions[current + 1];
  $('#next-question-card').hidden = !nextQuestion;
  $('#next-card-number').textContent = nextQuestion
    ? String(current + 2).padStart(2, '0')
    : '';
  $('#next-question-text').textContent = nextQuestion ? nextQuestion.text : '';
  $('.card-under-middle').hidden = current + 2 >= questions.length;
  $('.card-under-back').hidden = current + 3 >= questions.length;
  $('#score').textContent = score;
  $('#progress-percent').textContent = `${current * 10}%`;
  $('#progress-fill').style.width = `${current * 10}%`;
  $('.progress-track').setAttribute('aria-valuenow', current);
  $('#opinion').disabled = false;
  $('#fact').disabled = false;
  card.focus({ preventScroll: true });
}

function startGame() {
  current = 0;
  score = 0;
  showScreen('play');
  renderQuestion();
}

async function answer(choice) {
  if (answered || $('#play').hidden) return;
  answered = true;
  const question = questions[current];
  const correct = choice === question.answer;
  if (correct) score += 1;
  $('#score').textContent = score;
  $('#opinion').disabled = true;
  $('#fact').disabled = true;
  $('#feedback-title').textContent = correct ? 'Benar!' : 'Salah!';
  $('#feedback-icon').textContent = correct ? '✓' : '×';
  $('#feedback-icon').classList.toggle('incorrect', !correct);
  const explanation = $('#feedback-description');
  explanation.hidden = correct || question.answer === 'opinion';
  explanation.textContent = explanation.hidden ? '' : question.explanation;
  $('#next').innerHTML =
    current === questions.length - 1
      ? 'Lihat hasil <span aria-hidden="true">↗</span>'
      : 'Lanjut <span aria-hidden="true">→</span>';
  await swipeCard(choice);
  dialog.showModal();
  $('#next').focus();
}

function nextQuestion() {
  dialog.close();
  current += 1;
  if (current < questions.length) {
    renderQuestion();
    return;
  }
  $('#final-score').textContent = score;
  $('#result-message').textContent =
    score === 10
      ? 'Sempurna! Kamu jeli membedakan fakta dan pendapat.'
      : score >= 6
      ? 'Bagus! Terus latih kejelianmu saat membaca informasi.'
      : 'Terus berlatih, ya! Ingat, fakta bisa dibuktikan, opini adalah pendapat.';
  showScreen('result');
  $('#restart').focus();
}

$('#start').addEventListener('click', startGame);
$('#restart').addEventListener('click', startGame);
$('#opinion').addEventListener('click', () => answer('opinion'));
$('#fact').addEventListener('click', () => answer('fact'));
$('#next').addEventListener('click', nextQuestion);
dialog.addEventListener('cancel', (event) => event.preventDefault());

card.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    answer(event.key === 'ArrowLeft' ? 'opinion' : 'fact');
  }
});

card.addEventListener('pointerdown', (event) => {
  if (answered || !event.isPrimary || event.button !== 0) return;
  drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
  card.setPointerCapture(event.pointerId);
  card.classList.add('dragging');
});

card.addEventListener('pointermove', (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const distance = event.clientX - drag.x;
  card.style.transform = `translateX(${distance}px) rotate(${Math.max(
    -18,
    Math.min(18, distance / 12)
  )}deg)`;
  const label = $('#swipe-label');
  label.textContent = distance < 0 ? 'OPINI' : 'FAKTA';
  label.style.color = distance < 0 ? '#7251d5' : '#53682b';
  label.style.opacity = String(Math.min(1, Math.abs(distance) / 65));
});

card.addEventListener('pointerup', (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const distance = event.clientX - drag.x;
  const vertical = event.clientY - drag.y;
  const threshold = Math.min(75, card.clientWidth * 0.25);
  if (
    Math.abs(distance) >= threshold &&
    Math.abs(distance) > Math.abs(vertical)
  ) {
    answer(distance < 0 ? 'opinion' : 'fact');
  } else {
    resetCard();
  }
});
function cancelDrag() {
  if (drag) resetCard();
}

card.addEventListener('pointercancel', cancelDrag);
card.addEventListener('lostpointercapture', cancelDrag);
