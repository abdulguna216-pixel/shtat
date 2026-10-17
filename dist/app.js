import { siteConfig } from './content.js';

function Navigation() {
  const button = document.querySelector('.menu-button');
  const menu = document.querySelector('#mobile-menu');
  const close = () => { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-label', 'Открыть меню'); };
  button.addEventListener('click', () => { const open = button.getAttribute('aria-expanded') !== 'true'; menu.hidden = !open; button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { close(); button.focus(); } });
}

function InformationDialog() {
  const dialog = document.querySelector('#information-dialog');
  let trigger;
  function open(label, title, text, cta) {
    trigger = document.activeElement;
    document.querySelector('#dialog-label').textContent = label;
    document.querySelector('#dialog-title').textContent = title;
    const content = document.querySelector('#dialog-content');
    content.replaceChildren();
    const p = document.createElement('p'); p.textContent = text; content.append(p);
    if (cta) { const link = document.createElement('a'); link.href = '#contact'; link.className = 'dialog-cta'; link.textContent = 'Обсудить задачу ↗'; link.addEventListener('click', () => dialog.close()); content.append(link); }
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    dialog.showModal();
  }
  document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => trigger?.focus({ preventScroll: true }));
  document.querySelector('[data-open-about]').addEventListener('click', () => open('/ О КОМПАНИИ', 'ШТАТ — АУТСОРСИНГ ПЕРСОНАЛА', 'Персонал для складов, производств и логистики. Работа начинается с обсуждения задачи: направления, графика, объёма и требований к сотрудникам. Условия подбора, оформления и взаимодействия согласуются индивидуально.', true));
  document.querySelector('[data-open-policy]').addEventListener('click', () => open('/ КОНФИДЕНЦИАЛЬНОСТЬ', 'ПОЛИТИКА ОБРАБОТКИ ДАННЫХ', siteConfig.privacyPolicy || 'Документ требует подтверждения владельцем компании. Реквизиты оператора, цели, основания, сроки обработки и порядок отзыва согласия пока не предоставлены. Сейчас форма не отправляет и не сохраняет ваши данные. Перед включением приёма заявок здесь должна быть размещена утверждённая политика.', false));
}

function Services() {
  for (const button of document.querySelectorAll('[data-service]')) {
    button.addEventListener('click', () => {
      document.querySelector('#service').value = button.dataset.service;
      document.querySelector('#contact').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      // Focus follows the service selection without interrupting anchor scrolling.
      document.querySelector('#name').focus({ preventScroll: true });
    });
  }
}

function FAQ() {
  const list = document.querySelector('#faq-list');
  siteConfig.faq.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'faq-item';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'faq-question'; button.id = `question-${index}`;
    button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', `answer-${index}`);
    const text = document.createElement('span'); text.textContent = item.question;
    const plus = document.createElement('span'); plus.className = 'faq-plus'; plus.textContent = '+'; plus.setAttribute('aria-hidden', 'true');
    button.append(text, plus);
    const answer = document.createElement('div'); answer.className = 'faq-answer'; answer.id = `answer-${index}`; answer.hidden = true; answer.setAttribute('role', 'region'); answer.setAttribute('aria-labelledby', button.id);
    if (!item.approved) { const note = document.createElement('small'); note.textContent = 'ТРЕБУЕТ ПОДТВЕРЖДЕНИЯ'; answer.append(note); }
    const p = document.createElement('p'); p.textContent = item.answer; answer.append(p);
    button.addEventListener('click', () => { const expanded = button.getAttribute('aria-expanded') !== 'true'; button.setAttribute('aria-expanded', String(expanded)); answer.hidden = !expanded; plus.textContent = expanded ? '−' : '+'; });
    row.append(button, answer); list.append(row);
  });
}

function Process() {
  const section = document.querySelector('#process');
  const steps = [...section.querySelectorAll('li')];
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let scheduled = false;
  function update() {
    scheduled = false;
    if (media.matches) { section.style.removeProperty('--belt-shift'); steps.forEach(step => step.classList.remove('is-active')); return; }
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const progress = Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height)));
    const active = Math.min(4, Math.floor(progress * 5));
    steps.forEach((step, index) => step.classList.toggle('is-active', index === active));
    section.style.setProperty('--belt-shift', `${(progress - .5) * 10}px`);
  }
  function onScroll() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  addEventListener('scroll', onScroll, { passive: true }); media.addEventListener('change', update); update();
}

function RequestForm() {
  const form = document.querySelector('#request-form');
  const status = document.querySelector('#form-status');
  const submit = form.querySelector('[type=submit]');
  let sending = false;
  function error(id, message) { const input = document.querySelector(`#${id}`); input.setAttribute('aria-invalid', String(Boolean(message))); document.querySelector(`#${id}-error`).textContent = message; }
  function valid() {
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    error('name', name.length < 2 || name.length > 100 ? 'Укажите имя: от 2 до 100 символов.' : '');
    const digits = phone.replace(/\D/g, '');
    error('phone', !/^[+\d\s()\-]+$/.test(phone) || digits.length < 10 || digits.length > 15 ? 'Укажите корректный номер телефона.' : '');
    error('comment', form.elements.comment.value.length > 2000 ? 'Комментарий должен содержать не больше 2000 символов.' : '');
    error('consent', !form.elements.consent.checked ? 'Подтвердите согласие с политикой.' : '');
    const invalid = form.querySelector('[aria-invalid=true]');
    if (invalid) invalid.focus();
    return !invalid;
  }
  for (const input of form.querySelectorAll('input, textarea')) input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') error(input.id, ''); status.textContent = ''; });
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (sending) return; status.textContent = '';
    if (!valid()) return;
    if (!siteConfig.requestEndpoint || !siteConfig.privacyPolicy) { status.textContent = 'Отправка пока не подключена. Заявка не отправлена: компании необходимо указать получателя и утвердить политику обработки данных.'; return; }
    sending = true; submit.disabled = true; form.setAttribute('aria-busy', 'true'); submit.textContent = 'Отправляем…';
    try {
      const endpoint = new URL(siteConfig.requestEndpoint, location.origin);
      if (endpoint.protocol !== 'https:') throw new Error('Для отправки необходим HTTPS.');
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000), body: JSON.stringify({ name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(), service: form.elements.service.value, comment: form.elements.comment.value.trim(), consent: true }) });
      const result = await response.json();
      if (!response.ok || result.delivered !== true) throw new Error('Получатель не подтвердил доставку заявки.');
      status.textContent = 'Заявка доставлена. Спасибо за обращение!'; form.reset();
    } catch { status.textContent = 'Не удалось подтвердить доставку заявки. Попробуйте позже.'; }
    finally { sending = false; submit.disabled = false; form.removeAttribute('aria-busy'); submit.innerHTML = 'Отправить заявку <span>↗</span>'; }
  });
}
Navigation(); InformationDialog(); Services(); FAQ(); Process(); RequestForm();
