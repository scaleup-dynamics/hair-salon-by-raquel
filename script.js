// ===== Mobile Menu Toggle =====
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMobileMenu() {
  mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.add('opacity-0', 'pointer-events-none');
  document.body.style.overflow = '';
}

if (menuBtn) menuBtn.addEventListener('click', openMobileMenu);
if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);
mobileLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

// ===== Booking Modal Functionality =====
const bookingModal = document.getElementById('booking-modal');
const modalContent = document.getElementById('modal-content');
const bookingForm = document.getElementById('booking-form');
const statusEl = document.getElementById('booking-status');
const submitBtn = document.getElementById('booking-submit');
const submitLabel = submitBtn ? submitBtn.querySelector('.submit-label') : null;

const fields = {
  name:  { input: document.getElementById('booking-name'),  error: document.getElementById('error-name') },
  email: { input: document.getElementById('booking-email'), error: document.getElementById('error-email') },
  phone: { input: document.getElementById('booking-phone'), error: document.getElementById('error-phone') },
  date:  { input: document.getElementById('booking-date'),  error: document.getElementById('error-date') },
};

// Prevent selecting a past date
if (fields.date.input) {
  fields.date.input.min = new Date().toISOString().split('T')[0];
}

function focusFirstField() {
  if (fields.name.input) fields.name.input.focus();
}

function setModalHidden(hidden) {
  bookingModal.setAttribute('aria-hidden', String(hidden));
  bookingModal.classList.toggle('opacity-0', hidden);
  bookingModal.classList.toggle('pointer-events-none', hidden);
  modalContent.classList.toggle('scale-95', hidden);
  modalContent.classList.toggle('scale-100', !hidden);
  document.body.style.overflow = hidden ? '' : 'hidden';
}

function openBookingModal(e) {
  if (e && e.preventDefault) e.preventDefault();
  setModalHidden(false);
  focusFirstField();
}

function closeBookingModal() {
  setModalHidden(true);
  document.body.style.overflow = '';
}

if (bookingModal) {
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeBookingModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && bookingModal && !bookingModal.classList.contains('opacity-0')) {
    closeBookingModal();
  }
});

const EMAIL_RE = /^[A-Za-z0-9._%+-]{2,}@[A-Za-z0-9][A-Za-z0-9.-]{0,61}\.[A-Za-z]{2,}$/;

const COMMON_PROVIDERS = ['gmail.com','yahoo.com','outlook.com','hotmail.com','aol.com','icloud.com','protonmail.com','proton.me','live.com','msn.com','comcast.net','att.net','verizon.net','sbcglobal.net','ymail.com','yahoo.co.uk','yahoo.com.au','yahoo.co.in'];
function isFreeProvider(value) {
  const domain = value.trim().split('@').pop().toLowerCase();
  return COMMON_PROVIDERS.includes(domain);
}

function isValidEmail(value) {
  const v = value.trim();
  if (!v || v.length > 254) return false;
  if (!EMAIL_RE.test(v)) return false;
  if (v.includes('..')) return false;
  // Require a recognizable provider — blocks obvious junk like fyguhi@yuij.bn
  if (!isFreeProvider(v)) return false;
  return true;
}

function normalizePhone(value) {
  // strip everything except digits; allow a leading int/STD +
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('1') && digits.length === 11) digits = digits.slice(1);
  return digits;
}

function isValidPhone(value) {
  const digits = normalizePhone(value);
  // US: 10 digits, not all identical, not starting with 0
  return digits.length === 10 && digits[0] !== '0' && !/^(\d)\1{9}$/.test(digits);
}

// ===== Validation =====
function validateField(name) {
  const { input, error } = fields[name];
  const value = input.value.trim();
  let message = '';

  if (!value) {
    message = 'This field is required.';
  } else if (name === 'name' && value.length < 2) {
    message = 'Enter your full name.';
  } else if (name === 'email' && !isValidEmail(value)) {
    message = 'Enter a valid email from a known provider (Gmail, Yahoo, Outlook, iCloud…).';
  } else if (name === 'phone' && !isValidPhone(value)) {
    message = 'Enter a valid 10-digit phone number.';
  } else if (name === 'date' && input.min && value < input.min) {
    message = 'Choose today or a future date.';
  }

  if (message) {
    error.textContent = message;
    error.classList.remove('hidden');
    input.setAttribute('aria-invalid', 'true');
    return false;
  }
  error.textContent = '';
  error.classList.add('hidden');
  input.removeAttribute('aria-invalid');
  return true;
}

function validateAll() {
  return Object.keys(fields).every(validateField);
}

Object.entries(fields).forEach(([name, { input }]) => {
  if (!input) return;
  input.addEventListener('blur', () => validateField(name));
  input.addEventListener('input', () => {
    const { error } = fields[name];
    hideStatus();
    if (!error.classList.contains('hidden')) validateField(name);
  });
});

function setStatus(kind, message) {
  statusEl.textContent = message;
  statusEl.classList.remove('hidden', 'bg-green-600/10', 'text-green-700', 'bg-red-600/10', 'text-red-700');
  statusEl.classList.add(...(kind === 'success' ? ['bg-green-600/10', 'text-green-700'] : ['bg-red-600/10', 'text-red-700']));
}

function hideStatus() {
  statusEl.classList.add('hidden');
  statusEl.textContent = '';
}

function clearFieldError(name) {
  const { input, error } = fields[name];
  if (!error) return;
  error.textContent = '';
  error.classList.add('hidden');
  input.removeAttribute('aria-invalid');
}

function setBusy(busy) {
  submitBtn.setAttribute('aria-busy', String(busy));
  submitBtn.disabled = busy;
  if (submitLabel) submitLabel.textContent = busy ? 'Sending…' : 'Confirm Request';
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setStatus('error', 'Please fix the highlighted fields and try again.');
      return;
    }

    setBusy(true);
    setStatus('success', 'Sending your request…');

    const data = Object.fromEntries(new FormData(bookingForm).entries());
    // No backend is wired yet — simulate a successful send and log the request.
    await new Promise(resolve => setTimeout(resolve, 900));
    console.log('Booking request:', data);

    setBusy(false);
    setStatus('success', 'Thanks! Raquel Mae will reach out shortly to confirm your appointment.');
  });
}
