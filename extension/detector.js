function luhnValid(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function checkSensitive(text) {
  if (typeof text !== 'string' || !text) return null;
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) return 'email';
  if (/(?:\+?\d[\d .()\-]{8,}\d)/.test(text)) return 'phone_number';
  const cardMatch = text.match(/\b(?:\d[ -]*?){13,19}\b/);
  if (cardMatch && luhnValid(cardMatch[0])) return 'card_number';
  return null;
}
