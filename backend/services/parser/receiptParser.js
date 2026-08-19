// Toggle for verbose parser logging
const PARSER_DEBUG = true;

const logParser = (title, data) => {
  if (PARSER_DEBUG) {
    console.log(`[PARSER_DEBUG] === ${title} ===`);
    console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    console.log(`[PARSER_DEBUG] ========================\n`);
  }
};

const cleanOCRText = (text) => {
  let cleaned = text;

  // Normalize currency symbol
  cleaned = cleaned.replace(/₹/g, 'Rs');

  // Fix common OCR errors: letter 'l' or 'I' instead of '1' in numeric context
  cleaned = cleaned.replace(/(\d)[lI](\d)/g, '$11$2');
  cleaned = cleaned.replace(/(\d)[lI]\b/g, '$11');
  cleaned = cleaned.replace(/\b[lI](\d)/g, '1$1');
  cleaned = cleaned.replace(/(\d+)\s*[lI](\d{2})\b/g, '$1.$2');

  // Fix common OCR errors: letter 'O' instead of '0' in numeric context
  cleaned = cleaned.replace(/(\d)O(\d)/g, '$10$2');
  cleaned = cleaned.replace(/(\d)O\b/g, '$10');
  cleaned = cleaned.replace(/\bO(\d)/g, '0$1');

  // Replace duplicate spacing/tabs
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  return cleaned;
};

const detectMerchant = (lines, rawText) => {
  const metadataKeywords = [
    'invoice', 'receipt', 'order', 'bill', 'gst', 'gstin', 'date', 'time', 'cashier', 
    'pos', 'phone', 'tel', 'mobile', 'address', 'email', 'website', 'payment', 'upi', 
    'thank', 'customer', 'welcome', 'challan', 'store', 'terminal', 'merchant', 'cash', 
    'card', 'rupay', 'visa', 'mastercard', 'slip', 'token', 'hsn', 'sac', 
    'tax', 'cfee', 'sfee', 'table', 'pumps', 'station', 'retail', 'outlet', 'service', 
    'no.', 'no :', 'ph:', 'contact', 'www.', 'http', 'mode', 'authorized', 'copy'
  ];

  const skipRegex = new RegExp(metadataKeywords.map(k => `\\b${k}\\b|${k}\\s*:`).join('|'), 'i');

  const candidates = [];
  
  // Inspect first 8 lines of the receipt
  const scanLimit = Math.min(lines.length, 8);
  for (let i = 0; i < scanLimit; i++) {
    const line = lines[i].trim();
    
    if (
      line.length < 3 || 
      line.match(/^[=\-\*\._\s\/\\]+$/) || 
      line.match(/^\d/) || 
      skipRegex.test(line)
    ) {
      continue;
    }

    let cleaned = line.replace(/[^a-zA-Z0-9\s&\-\'\.\+]/g, '').trim();
    cleaned = cleaned.replace(/\s+/g, ' ');

    if (cleaned.length >= 3) {
      candidates.push(cleaned);
    }
  }

  logParser('Merchant Candidates Identified', candidates);

  if (candidates.length > 0) {
    return candidates[0];
  }

  const commonMerchants = [
    { name: 'DMart', pattern: /\bd\s*mart\b/i },
    { name: 'Reliance Smart', pattern: /\breliance\s*smart\b/i },
    { name: 'Reliance Trends', pattern: /\breliance\s*trends\b/i },
    { name: 'Reliance Digital', pattern: /\breliance\s*digital\b/i },
    { name: 'Big Bazaar', pattern: /\bbig\s*bazaar\b/i },
    { name: 'Starbucks', pattern: /\bstarbucks\b/i },
    { name: 'McDonald\'s', pattern: /\bmcdonald\b/i },
    { name: 'KFC', pattern: /\bkfc\b/i },
    { name: 'Domino\'s', pattern: /\bdomino\b/i },
    { name: 'Decathlon', pattern: /\bdecathlon\b/i },
    { name: 'Apollo Pharmacy', pattern: /\bapollo\s*pharmacy\b/i },
    { name: 'MedPlus', pattern: /\bmedplus\b/i },
    { name: 'Shell', pattern: /\bshell\b/i },
    { name: 'HP Petrol', pattern: /\bhp\s*petrol\b|\bhp\s*fuel\b/i },
    { name: 'Indian Oil', pattern: /\bindian\s*oil\b/i },
    { name: 'Bharat Petroleum', pattern: /\bbharat\s*petroleum\b|\bbpcl\b/i }
  ];

  for (let merchant of commonMerchants) {
    if (merchant.pattern.test(rawText)) {
      return merchant.name;
    }
  }

  return 'Unknown Merchant';
};

const extractAmount = (lines, rawText) => {
  const totalLabels = [
    /amount\s*payable/i,
    /grand\s*total/i,
    /net\s*amount/i,
    /invoice\s*total/i,
    /total\s*payable/i,
    /final\s*total/i,
    /net\s*payable/i,
    /total\s*due/i,
    /\btotal\b/i
  ];

  let selectedAmount = 0;
  const matchesByLabel = [];

  for (let label of totalLabels) {
    for (let line of lines) {
      if (label.test(line)) {
        const labelIndex = line.search(label);
        const searchSubstring = line.substring(labelIndex);
        
        // Match numbers like 1,268.90 or 1268,90 or 1268.90 safely
        const numRegex = /\b\d+(?:[\d\.,]*\d)?\b/g;
        const numbers = searchSubstring.match(numRegex) || [];
        
        const parsedNumbers = numbers.map(num => {
          let cleaned = num;
          cleaned = cleaned.replace(/[\.,]$/, '');
          
          if (cleaned.includes(',') && cleaned.includes('.')) {
            cleaned = cleaned.replace(/,/g, '');
          } else if (cleaned.includes(',')) {
            const parts = cleaned.split(',');
            if (parts[1] && parts[1].length === 2) {
              cleaned = parts[0] + '.' + parts[1];
            } else {
              cleaned = cleaned.replace(/,/g, '');
            }
          }
          return parseFloat(cleaned);
        }).filter(n => !isNaN(n) && n > 0);

        if (parsedNumbers.length > 0) {
          const maxAmountOnLine = Math.max(...parsedNumbers);
          matchesByLabel.push({ label: label.source, amount: maxAmountOnLine, line });
        }
      }
    }

    if (matchesByLabel.length > 0) {
      selectedAmount = matchesByLabel[0].amount;
      logParser(`Amount Selected via Label "${matchesByLabel[0].label}"`, selectedAmount);
      break;
    }
  }

  // Fallback: collect every monetary value in the receipt and choose the largest realistic amount
  if (selectedAmount === 0) {
    logParser('No total label found. Running fallback max monetary value scan...');
    const fallbackRegex = /\b\d+[\.,]\d{2}\b/g;
    const allMatches = rawText.match(fallbackRegex) || [];
    
    const parsedAmounts = allMatches.map(val => {
      let cleaned = val;
      if (cleaned.includes(',') && cleaned.includes('.')) {
        cleaned = cleaned.replace(/,/g, '');
      } else if (cleaned.includes(',')) {
        const parts = cleaned.split(',');
        if (parts[1] && parts[1].length === 2) {
          cleaned = parts[0] + '.' + parts[1];
        } else {
          cleaned = cleaned.replace(/,/g, '');
        }
      }
      return parseFloat(cleaned);
    }).filter(val => {
      return !isNaN(val) && val > 0 && val < 500000;
    });

    logParser('Fallback Amount Candidates', parsedAmounts);

    if (parsedAmounts.length > 0) {
      selectedAmount = Math.max(...parsedAmounts);
      logParser('Selected Max Fallback Amount', selectedAmount);
    }
  }

  return selectedAmount;
};

const extractDate = (rawText) => {
  const monthMap = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };

  const padZero = (num) => String(num).padStart(2, '0');

  // Format 1: YYYY-MM-DD
  const ymdRegex = /\b(\d{4})[-/\.](\d{1,2})[-/\.](\d{1,2})\b/;
  const ymdMatch = rawText.match(ymdRegex);
  if (ymdMatch) {
    return {
      date: `${ymdMatch[1]}-${padZero(ymdMatch[2])}-${padZero(ymdMatch[3])}`,
      found: true
    };
  }

  // Format 2: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyRegex = /\b(\d{1,2})[-/\.](\d{1,2})[-/\.](\d{4})\b/;
  const dmyMatch = rawText.match(dmyRegex);
  if (dmyMatch) {
    const year = dmyMatch[3];
    const month = padZero(dmyMatch[2]);
    const day = padZero(dmyMatch[1]);
    if (parseInt(month) <= 12 && parseInt(day) <= 31) {
      return {
        date: `${year}-${month}-${day}`,
        found: true
      };
    }
  }

  // Format 3: DD Month YYYY (e.g., "17 Jul 2026" or "17 July 2026")
  const textMonthRegex = /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\b/i;
  const textMonthMatch = rawText.match(textMonthRegex);
  if (textMonthMatch) {
    const day = padZero(textMonthMatch[1]);
    const month = monthMap[textMonthMatch[2].toLowerCase()];
    const year = textMonthMatch[3];
    return {
      date: `${year}-${month}-${day}`,
      found: true
    };
  }

  return {
    date: new Date().toISOString().split('T')[0],
    found: false
  };
};

const extractTax = (lines) => {
  let cgst = 0;
  let sgst = 0;
  let totalTax = 0;

  const cgstRegex = /\b(?:cgst)\b.*?\b(\d+[\.,]\d{2})\b/i;
  const sgstRegex = /\b(?:sgst)\b.*?\b(\d+[\.,]\d{2})\b/i;
  const gstRegex = /\b(?:gst|vat|tax|sales\s*tax)\b.*?\b(\d+[\.,]\d{2})\b/i;

  const parseNum = (str) => parseFloat(str.replace(',', '.'));

  for (let line of lines) {
    const cgstMatch = line.match(cgstRegex);
    if (cgstMatch) {
      cgst += parseNum(cgstMatch[1]);
    }
    const sgstMatch = line.match(sgstRegex);
    if (sgstMatch) {
      sgst += parseNum(sgstMatch[1]);
    }
    const gstMatch = line.match(gstRegex);
    if (gstMatch && !cgstMatch && !sgstMatch) {
      const val = parseNum(gstMatch[1]);
      if (val > totalTax) {
        totalTax = val;
      }
    }
  }

  if (cgst > 0 || sgst > 0) {
    return parseFloat((cgst + sgst).toFixed(2));
  }

  return parseFloat(totalTax.toFixed(2));
};

const extractItems = (lines) => {
  const items = [];
  const metadataRegex = /(?:total|subtotal|tax|gst|vat|cgst|sgst|discount|savings|net|payable|paid|cash|card|upi|change|balance|hsn|invoice|customer|thank|round|items|mall|plot|gate|bengaluru|karnataka|india|road|street|floor|avenue|ltd|pvt|corp|store|cashier|pos|time|date|bill\s*no|tel|phone|mobile)/i;

  const itemLines = lines.slice(Math.min(lines.length, 5));

  for (let line of itemLines) {
    if (metadataRegex.test(line)) {
      continue;
    }

    let namePart = line;
    namePart = namePart.replace(/\s+\d+(?:[\.,]\d{2})?\s+\d+(?:[\.,]\d{2})?\s*$/, '');
    namePart = namePart.replace(/\s+\d+(?:[\.,]\d{2})?\s*$/, '');
    namePart = namePart.replace(/\s+\d+\s*$/, '');
    namePart = namePart.replace(/\s+\d+(?:\.\d+)?\s*(?:kg|g|ltr|ml|pcs|pc|qty)\b/i, '');
    namePart = namePart.replace(/\b\d{4,8}\b/g, '');

    let cleanName = namePart.replace(/[^a-zA-Z0-9\s\-\'\+]/g, '').trim();
    cleanName = cleanName.replace(/\s+/g, ' ');

    if (cleanName.length > 2 && isNaN(cleanName) && !cleanName.match(/^\d+$/)) {
      if (!cleanName.match(/^(?:total|subtotal|discount|tax|cash|card|change|balance|items)$/i)) {
        items.push(cleanName);
      }
    }
  }

  return items;
};

const calculateConfidence = (merchant, amount, dateFound, items, rawText) => {
  let score = 1.0;
  
  if (merchant === 'Unknown Merchant') {
    score -= 0.25;
  }
  if (amount === 0) {
    score -= 0.35;
  }
  if (!dateFound) {
    score -= 0.15;
  }
  if (rawText.length < 50) {
    score -= 0.1;
  }
  if (items.length === 0) {
    score -= 0.15;
  }
  
  return Math.max(0.1, Math.min(1.0, parseFloat(score.toFixed(2))));
};

const parseReceiptText = (text) => {
  if (!text) {
    return {
      merchant: 'Unknown Merchant',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      items: [],
      tax: 0,
      confidence: 0.1
    };
  }

  logParser('OCR Raw Text Received', text);

  const cleanedText = cleanOCRText(text);
  logParser('Cleaned Text', cleanedText);

  const lines = cleanedText.split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const merchant = detectMerchant(lines, cleanedText);
  logParser('Selected Merchant', merchant);

  const amount = extractAmount(lines, cleanedText);
  logParser('Selected Amount', amount);

  const dateObj = extractDate(cleanedText);
  logParser('Selected Date', dateObj.date);

  const tax = extractTax(lines);
  logParser('Selected Tax', tax);

  const items = extractItems(lines);
  logParser('Extracted Items', items);

  const confidence = calculateConfidence(merchant, amount, dateObj.found, items, cleanedText);
  logParser('Computed Confidence Score', confidence);

  const parsedOutput = {
    merchant: merchant || 'Unknown Merchant',
    date: dateObj.date,
    amount,
    items,
    tax,
    confidence
  };

  logParser('Final Parsed Output Object', parsedOutput);
  return parsedOutput;
};

module.exports = {
  parseReceiptText,
};
