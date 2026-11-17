const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const introduction = document.querySelector('.invitation-intro');
const languageButtons = introduction.querySelectorAll('[data-language]');
const languageChoices = languageButtons[0].parentElement;
const skipIntro = introduction.querySelector('#skip-intro');
const skipButton = skipIntro.querySelector('button');
const main = document.querySelector('main');
const page = document.documentElement;

function selectLanguage(language) {
  if (language !== 'ur') return;

  page.lang = 'ur';
  page.dir = 'rtl';
  document.title = 'اویس احمد · دعوتِ ولیمہ';
  introduction.setAttribute('aria-label', 'دعوت نامہ کھولیے');
  for (const element of document.querySelectorAll('[data-urdu]')) {
    element.textContent = element.dataset.urdu;
  }
  skipButton.textContent = 'متحرک منظر چھوڑیں';
  updateCountdown();
}

if (typeof introduction.showModal === 'function') {
  let revealTimeout;
  window.scrollTo({ top: 0, behavior: 'instant' });
  introduction.showModal();
  page.classList.add('invitation-opening');

  introduction.addEventListener('close', () => {
    window.clearTimeout(revealTimeout);
    page.classList.remove('invitation-opening');
    main.focus({ preventScroll: true });
  });

  introduction.addEventListener('animationend', (event) => {
    if (event.animationName === 'cover-split') {
      introduction.close();
    }
  });

  for (const button of languageButtons) {
    button.addEventListener('click', () => {
      selectLanguage(button.dataset.language);
      if (reducedMotion.matches) {
        introduction.close();
        return;
      }
      introduction.classList.add('is-revealing');
      languageChoices.hidden = true;
      skipIntro.hidden = false;
      skipButton.focus({ preventScroll: true });
      revealTimeout = window.setTimeout(() => introduction.close(), 1450);
    });
  }

  skipButton.addEventListener('click', () => introduction.close());
}


if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const text = main.querySelectorAll([
    '.intro > *', '.section-heading > *', '.event-date',
    '.event-body > *', '.calendar-actions', '.closing > *'
  ].join(', '));
  const observer = new IntersectionObserver((items) => {
    for (const item of items) {
      if (!item.isIntersecting) continue;
      item.target.classList.replace('scroll-text-pending', 'scroll-text-visible');
      observer.unobserve(item.target);
    }
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.12 });

  text.forEach((element) => element.classList.add('scroll-text-pending'));
  const observeText = () => text.forEach((element) => observer.observe(element));
  if (introduction.open) {
    introduction.addEventListener('close', observeText, { once: true });
  } else {
    observeText();
  }


  const sparkles = document.querySelector('.sparkles');
  for (let index = 0; index < 20; index += 1) {
    const sparkle = document.createElement('i');
    sparkle.style.setProperty('--x', `${8 + (index * 37) % 84}%`);
    sparkle.style.setProperty('--y', `${10 + (index * 29) % 80}%`);
    sparkle.style.setProperty('--delay', `${index % 7 / 2}s`);
    sparkles.append(sparkle);
  }
}

const countdown = document.querySelector('.countdown');
const countdownUnits = Object.fromEntries(
  Array.from(countdown.querySelectorAll('[data-unit]'), (element) => [element.dataset.unit, element])
);
const walimaStart = new Date(document.querySelector('#walima-start').dateTime);

function updateCountdown() {
  const remaining = Math.ceil((walimaStart.getTime() - Date.now()) / 1000);
  countdown.hidden = remaining <= 0;
  if (countdown.hidden) return false;
  const values = {
    days: Math.floor(remaining / 86400),
    hours: Math.floor(remaining / 3600) % 24,
    minutes: Math.floor(remaining / 60) % 60,
    seconds: remaining % 60
  };
  for (const [unit, value] of Object.entries(values)) {
    countdownUnits[unit].textContent = String(value).padStart(2, '0');
  }
  return true;
}

if (updateCountdown()) {
  const timer = setInterval(() => {
    if (!updateCountdown()) clearInterval(timer);
  }, 1000);
}

const calendarButton = document.querySelector('#calendar');
calendarButton.parentElement.hidden = false;

function calendarTime(date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '');
}

calendarButton.addEventListener('click', () => {
  const urdu = page.lang === 'ur';
  const title = urdu ? 'دعوتِ ولیمہ' : 'Walima Reception';
  const location = urdu ? 'تاج محل میرج ہال' : 'Taj Mahal Marriage Hall';
  const end = new Date(document.querySelector('#walima-end').dateTime);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Awais Ahmed//Walima Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:walima-awais-ahmad-december-2026',
    `DTSTAMP:${calendarTime(new Date())}`,
    `DTSTART:${calendarTime(walimaStart)}`,
    `DTEND:${calendarTime(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
    ''
  ];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }));
  const download = document.createElement('a');
  download.href = url;
  download.download = 'awais-ahmed-walima.ics';
  document.body.append(download);
  download.click();
  download.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
