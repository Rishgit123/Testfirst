'use strict';

const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');

let currentValue = '0';
let previousValue = '';
let operator = null;
let shouldResetDisplay = false;
let justEvaluated = false;

function updateDisplay(value) {
  const display = formatNumber(value);
  resultEl.textContent = display;
  resultEl.classList.toggle('small', display.length > 9);
}

function formatNumber(value) {
  if (value === 'Error') return 'Error';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  // Avoid scientific notation for reasonable numbers
  if (Math.abs(num) < 1e12 && Math.abs(num) >= 1e-6 || num === 0) {
    // Show up to 10 significant digits
    const str = parseFloat(num.toPrecision(10)).toString();
    return str;
  }
  return num.toExponential(6);
}

function handleDigit(digit) {
  if (shouldResetDisplay || justEvaluated) {
    currentValue = digit;
    shouldResetDisplay = false;
    justEvaluated = false;
  } else {
    if (currentValue === '0' && digit !== '.') {
      currentValue = digit;
    } else if (currentValue.length < 12) {
      currentValue += digit;
    }
  }
  updateDisplay(currentValue);
}

function handleDecimal() {
  if (shouldResetDisplay || justEvaluated) {
    currentValue = '0.';
    shouldResetDisplay = false;
    justEvaluated = false;
    updateDisplay(currentValue);
    return;
  }
  if (!currentValue.includes('.')) {
    currentValue += '.';
    updateDisplay(currentValue);
  }
}

function handleOperator(op) {
  justEvaluated = false;
  if (operator && !shouldResetDisplay) {
    // Chain calculation
    evaluate();
  }
  previousValue = currentValue;
  operator = op;
  shouldResetDisplay = true;

  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  expressionEl.textContent = `${formatNumber(previousValue)} ${opSymbols[op]}`;

  // Highlight active operator button
  document.querySelectorAll('.btn-operator').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === op);
  });
}

function evaluate() {
  if (operator === null || previousValue === '') return;

  const a = parseFloat(previousValue);
  const b = parseFloat(currentValue);
  let result;

  switch (operator) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/':
      if (b === 0) {
        currentValue = 'Error';
        expressionEl.textContent = '';
        updateDisplay(currentValue);
        resetState();
        return;
      }
      result = a / b;
      break;
    default: return;
  }

  const opSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
  expressionEl.textContent = `${formatNumber(previousValue)} ${opSymbols[operator]} ${formatNumber(currentValue)} =`;

  currentValue = String(parseFloat(result.toPrecision(12)));
  updateDisplay(currentValue);
  resetState();
  justEvaluated = true;
}

function resetState() {
  operator = null;
  previousValue = '';
  shouldResetDisplay = true;
  document.querySelectorAll('.btn-operator').forEach(btn => btn.classList.remove('active'));
}

function handleClear() {
  currentValue = '0';
  previousValue = '';
  operator = null;
  shouldResetDisplay = false;
  justEvaluated = false;
  expressionEl.textContent = '';
  updateDisplay('0');
  document.querySelectorAll('.btn-operator').forEach(btn => btn.classList.remove('active'));
}

function handleToggleSign() {
  if (currentValue === '0' || currentValue === 'Error') return;
  currentValue = currentValue.startsWith('-')
    ? currentValue.slice(1)
    : '-' + currentValue;
  updateDisplay(currentValue);
}

function handlePercent() {
  if (currentValue === 'Error') return;
  currentValue = String(parseFloat(currentValue) / 100);
  updateDisplay(currentValue);
}

// Event delegation on the button grid
document.querySelector('.buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit':    handleDigit(value); break;
    case 'decimal':  handleDecimal(); break;
    case 'operator': handleOperator(value); break;
    case 'equals':   evaluate(); break;
    case 'clear':    handleClear(); break;
    case 'toggle-sign': handleToggleSign(); break;
    case 'percent':  handlePercent(); break;
  }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
  else if (e.key === '.') handleDecimal();
  else if (e.key === '+') handleOperator('+');
  else if (e.key === '-') handleOperator('-');
  else if (e.key === '*') handleOperator('*');
  else if (e.key === '/') { e.preventDefault(); handleOperator('/'); }
  else if (e.key === 'Enter' || e.key === '=') evaluate();
  else if (e.key === 'Escape') handleClear();
  else if (e.key === '%') handlePercent();
  else if (e.key === 'Backspace') {
    if (currentValue.length > 1 && currentValue !== 'Error') {
      currentValue = currentValue.slice(0, -1) || '0';
      updateDisplay(currentValue);
    } else {
      currentValue = '0';
      updateDisplay('0');
    }
  }
});

// Initial render
updateDisplay('0');
