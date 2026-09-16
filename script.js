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
const cardPoses = [
  'translateY(0px) scaleX(1) rotate(0deg)',
  'translateY(7px) scaleX(0.97) rotate(8deg)',
  'translateY(14px) scaleX(0.94) rotate(-11deg)',
];
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
}

async function swipeCard(choice) {
  const startTransform = getComputedStyle(card).transform;
  const pointerId = drag?.id;
  drag = null;
  card.classList.remove('dragging');
  if (pointerId !== undefined && card.hasPointerCapture(pointerId)) {
    card.releasePointerCapture(pointerId);
  }

  const direction = choice === 'fact' ? -1 : 1;
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
  [card, $('#next-question-card'), $('.card-under-middle')]
    .forEach((layer, offset) => {
      layer.style.setProperty('--card-pose', cardPoses[offset]);
    });
  $('#question-text').textContent = questions[current].text;
  const nextQuestion = questions[current + 1];
  $('#next-question-card').hidden = !nextQuestion;
  $('#next-question-text').textContent = nextQuestion ? nextQuestion.text : '';
  $('.card-under-middle').hidden = current + 2 >= questions.length;
  $('#opinion').disabled = false;
  $('#fact').disabled = false;
  card.focus({ preventScroll: true });
}

async function showInstructions() {
  const startButton = $('#start');
  if (startButton.disabled) return;
  startButton.disabled = true;
  await $('#instruction img').decode().catch(() => {});
  showScreen('instruction');
  $('#instruction').focus({ preventScroll: true });
  window.setTimeout(() => {
    startGame();
    startButton.disabled = false;
  }, 3000);
}

function startGame() {
  $('#share-status').textContent = '';
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
  $('#opinion').disabled = true;
  $('#fact').disabled = true;
  $('#feedback-title').textContent = correct
    ? `Benar! Itu adalah ${question.answer === 'fact' ? 'fakta' : 'opini'}.`
    : `Salah! Jawaban yang benar adalah ${question.answer === 'fact' ? 'fakta' : 'opini'}.`;
  dialog.classList.add('feedback-artwork');
  dialog.classList.toggle('feedback-correct', correct);
  $('#feedback-text').hidden = true;
  const feedbackImage = $('#feedback-image');
  feedbackImage.hidden = false;
  const answerType = question.answer === 'fact' ? 'fakta' : 'opini';
  feedbackImage.src = correct
    ? `img/popup-benar-${answerType}.png`
    : `img/popup-salah-jawaban-${answerType}.png`;
  $('#feedback-icon').textContent = correct ? '✓' : '×';
  $('#feedback-icon').classList.toggle('incorrect', !correct);
  const explanation = $('#feedback-description');
  explanation.hidden = correct || question.answer === 'opinion';
  explanation.textContent = explanation.hidden ? '' : `Kenapa?\n\n${question.explanation}`;
  $('#next').setAttribute('aria-label',
    current === questions.length - 1 ? 'Lihat hasil' : correct ? 'Soal berikutnya' : 'Lanjut');
  const nextImage = $('#next img');
  nextImage.src = correct ? 'img/button-next-question.png' : 'img/button-lanjut.png';
  await Promise.all([
    swipeCard(choice),
    feedbackImage.decode().catch(() => {}),
    nextImage.decode().catch(() => {}),
  ]);
  dialog.showModal();
  $('#next').focus();
}

const resultCharacters = {
  terkecoh: {
    alt: 'Si gampang terkecoh',
    message: 'Kadang fakta dan opini memang bikin bingung. Yuk, baca lebih jeli dan coba lagi!',
  },
  jeli: {
    alt: 'Si jeli',
    message: 'Insting literasimu sudah mulai terbentuk. Tinggal lebih teliti sedikit!',
  },
  'paling-jeli': {
    alt: 'Si paling jeli',
    message: 'Wah, kamu cukup peka menangkap mana fakta dan mana opini!',
  },
  jenius: {
    alt: 'Si jenius',
    message: 'Nggak gampang terkecoh. Kamu berhasil bedain fakta dan opini dengan sempurna!',
  },
};

function nextQuestion() {
  dialog.close();
  current += 1;
  if (current < questions.length) {
    renderQuestion();
    return;
  }
  const finalScore = score * 10;
  const character = finalScore === 100
    ? 'jenius'
    : finalScore >= 80
      ? 'paling-jeli'
      : finalScore >= 60
        ? 'jeli'
        : 'terkecoh';
  setResultCharacter(character);
  $('#final-score').textContent = finalScore;
  $('#correct-count').textContent = score;
  $('#incorrect-count').textContent = questions.length - score;
  showScreen('result');
  $('#restart').focus();
}

function setResultCharacter(character) {
  const result = resultCharacters[character];
  const image = $('.result-character');
  image.src = `img/char-closing-${character}.png`;
  image.alt = result.alt;
  image.dataset.character = character;
  $('#result-message').textContent = result.message;
}

async function copyShareText(text, platform) {
  try {
    await navigator.clipboard.writeText(text);
    $('#share-status').textContent = `Hasil disalin! Tempelkan di ${platform} untuk membagikannya.`;
  } catch {
    window.prompt(`Salin hasil ini, lalu tempelkan di ${platform}:`, text);
  }
}

async function shareResult(platform) {
  const url = new URL(window.location.href);
  url.hash = '';
  const text = `Aku mendapat skor ${score * 10}/100 di kuis Fakta atau Opini! Yuk, coba dan lihat skormu!`;
  const fullText = `${text}\n${url.href}`;
  $('#share-status').textContent = '';

  if (platform === 'instagram') {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Hasil Kuis Fakta atau Opini', text, url: url.href });
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    await copyShareText(fullText, 'Instagram');
    return;
  }

  const targets = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(fullText)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url.href)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url.href)}`,
  };
  if (!targets[platform]) return;
  window.open(targets[platform], '_blank', 'noopener,noreferrer');
  if (platform === 'facebook') await copyShareText(fullText, 'Facebook');
}

document.querySelectorAll('[data-share]').forEach((button) => {
  button.addEventListener('click', () => shareResult(button.dataset.share));
});

$('#start').addEventListener('click', showInstructions);
$('#restart').addEventListener('click', () => {
  showScreen('welcome');
  $('#start').focus();
});
$('#opinion').addEventListener('click', () => answer('opinion'));
$('#fact').addEventListener('click', () => answer('fact'));
$('#next').addEventListener('click', nextQuestion);
dialog.addEventListener('cancel', (event) => event.preventDefault());

card.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    answer(event.key === 'ArrowLeft' ? 'fact' : 'opinion');
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
  )}deg) ${card.style.getPropertyValue('--card-pose')}`;
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
    answer(distance < 0 ? 'fact' : 'opinion');
  } else {
    resetCard();
  }
});
function cancelDrag() {
  if (drag) resetCard();
}

card.addEventListener('pointercancel', cancelDrag);
card.addEventListener('lostpointercapture', cancelDrag);
