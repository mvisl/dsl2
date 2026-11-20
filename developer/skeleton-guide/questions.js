const form = document.querySelector('#question-form');
const button = form.querySelector('button');
const status = document.querySelector('#question-status');
const draftKey = 'pd7045:question:v1';
let attempt;

try {
  attempt = JSON.parse(sessionStorage.getItem(draftKey));
  if (attempt?.payload) {
    form.elements.body.value = attempt.payload.body;
    form.elements.context.value = attempt.context;
  }
} catch {}

form.elements.body.addEventListener('invalid', () => {
  status.textContent = 'Введите вопрос.';
});
form.elements.body.addEventListener('input', () => {
  if (status.textContent === 'Введите вопрос.') status.textContent = '';
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const body = form.elements.body.value.trim();
  if (button.disabled || !body) {
    if (!body) status.textContent = 'Введите вопрос.';
    return;
  }
  const context = form.elements.context.value.trim();
  const qa = new URLSearchParams(location.search).get('qa') === '1';
  if (attempt?.payload?.body !== body || attempt.context !== context || Boolean(attempt.payload.qa) !== qa) {
    attempt = {
      context,
      payload: {
        title: 'Markets · скелетоны',
        body,
        context: context ? 'PD-7045 · ' + context : 'PD-7045',
        requestId: crypto.randomUUID(),
        ...(qa ? { qa: true } : {})
      }
    };
  }
  try { sessionStorage.setItem(draftKey, JSON.stringify(attempt)); } catch {}

  button.disabled = true;
  form.elements.body.readOnly = true;
  form.elements.context.readOnly = true;
  status.textContent = 'Отправляем…';
  try {
    const response = await fetch('https://design-workspace-github-auth.mvisl1.workers.dev/guest-inbox', {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt.payload),
      signal: AbortSignal.timeout(20000)
    });
    const receipt = await response.json();
    if (!response.ok || receipt.saved !== true || receipt.status !== 'pending' || receipt.id !== attempt.payload.requestId) {
      throw new Error('Missing receipt');
    }
    status.textContent = 'Вопрос принят. Номер ' + receipt.id;
    form.reset();
    attempt = undefined;
    try { sessionStorage.removeItem(draftKey); } catch {}
  } catch {
    status.textContent = 'Подтверждение не получено. Текст остался в форме. Повторите отправку.';
  } finally {
    button.disabled = false;
    form.elements.body.readOnly = false;
    form.elements.context.readOnly = false;
  }
});
