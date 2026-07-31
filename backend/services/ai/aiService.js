// Toggle for verbose debug logging
const DEBUG_MODE = true;

const logDebug = (title, data) => {
  if (DEBUG_MODE) {
    console.log(`[AI_DEBUG] === ${title} ===`);
    console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    console.log(`[AI_DEBUG] ====================\n`);
  }
};

// Check if Groq API key is present
const apiKey = process.env.GROQ_API_KEY;
const hasGroq = !!apiKey;

if (!hasGroq) {
  console.warn('GROQ_API_KEY is not configured in backend/.env. AI service will fall back to local parsing.');
}

// Local smart keyword-based classifier as fallback
const localClassify = (receiptData) => {
  const merchant = (receiptData.merchant || '').toLowerCase();
  const items = (receiptData.items || []).map((item) => item.toLowerCase());

  const rules = [
    {
      category: 'Food',
      keywords: ['coffee', 'cafe', 'starbucks', 'mcdonald', 'burger', 'pizza', 'food', 'hotel', 'dining', 'bakery', 'tea', 'bistro', 'canteen', 'swiggy', 'zomato', 'eat', 'grocery', 'supermarket', 'mart', 'market', 'deli', 'veg', 'restaurant', 'sweet', 'bakery'],
    },
    {
      category: 'Shopping',
      keywords: ['store', 'mall', 'shop', 'clothing', 'apparel', 'fashion', 'shoes', 'boots', 'wear', 'amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'reliance', 'trends', 'decathlon', 'gift', 'boutique', 'book', 'stationery', 'toy', 'electronics', 'digital', 'appliances'],
    },
    {
      category: 'Travel',
      keywords: ['uber', 'ola', 'taxi', 'cab', 'irctc', 'rail', 'train', 'flight', 'airline', 'metro', 'fuel', 'petrol', 'diesel', 'cng', 'parking', 'toll', 'bus', 'travel', 'trip', 'hotel', 'stay', 'airbnb', 'automotive'],
    },
    {
      category: 'Bills',
      keywords: ['electricity', 'power', 'water', 'gas', 'bill', 'recharge', 'wifi', 'broadband', 'internet', 'telecom', 'jio', 'airtel', 'vi', 'rent', 'lease', 'insurance', 'premium', 'tax', 'municipal', 'subscription'],
    },
    {
      category: 'Entertainment',
      keywords: ['netflix', 'prime', 'spotify', 'hotstar', 'cinema', 'movie', 'theatre', 'bookmyshow', 'game', 'gaming', 'arcade', 'club', 'bar', 'pub', 'lounge', 'concert', 'event', 'ticket', 'subscription', 'youtube'],
    },
    {
      category: 'Healthcare',
      keywords: ['pharmacy', 'chemist', 'medical', 'hospital', 'clinic', 'doctor', 'physio', 'labs', 'diagnostics', 'medicine', 'drug', 'health', 'fitness', 'gym', 'apollo', 'max'],
    },
    {
      category: 'Education',
      keywords: ['school', 'college', 'university', 'tuition', 'fee', 'course', 'udemy', 'coursera', 'book', 'stationery', 'library', 'exam', 'coaching', 'academy', 'training'],
    },
  ];

  // Try matching items list first (more specific)
  for (let item of items) {
    for (let rule of rules) {
      if (rule.keywords.some((keyword) => item.includes(keyword))) {
        return {
          title: receiptData.merchant !== 'Unknown Merchant' ? receiptData.merchant : `Purchase (${rule.category})`,
          category: rule.category,
          description: `Auto-classified based on item: ${item}`,
          confidence: 0.9,
        };
      }
    }
  }

  // Try matching merchant name next
  for (let rule of rules) {
    if (rule.keywords.some((keyword) => merchant.includes(keyword))) {
      return {
        title: receiptData.merchant !== 'Unknown Merchant' ? receiptData.merchant : `Purchase (${rule.category})`,
        category: rule.category,
        description: `Auto-classified based on merchant keywords`,
        confidence: 0.9,
      };
    }
  }

  return {
    title: receiptData.merchant || 'Purchase',
    category: 'Others',
    description: 'Auto-extracted details (low confidence fallback)',
    confidence: 0.5,
  };
};

// Robust JSON parsing utility
const parseRobustJSON = (text) => {
  if (typeof text !== 'string') {
    throw new Error('AI response is not a string');
  }

  let cleaned = text.trim();

  // Strip markdown formatting if wrapped in a ```json codeblock
  if (cleaned.includes('```json')) {
    cleaned = cleaned.split('```json')[1].split('```')[0].trim();
  } else if (cleaned.includes('```')) {
    cleaned = cleaned.split('```')[1].split('```')[0].trim();
  }

  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    logDebug('JSON Parsing Failure', { rawResponse: text, error: error.message });
    const parseError = new Error(`JSON parsing failure: ${error.message}`);
    parseError.name = 'JSONParseError';
    parseError.rawContent = text;
    throw parseError;
  }
};

// Promise-based timeout wrapper with proper cleanup to prevent resource leaks
const withTimeout = async (promise, ms) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const err = new Error(`Groq API request timed out after ${ms / 1000} seconds`);
      err.name = 'TimeoutError';
      reject(err);
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

// Detailed diagnostic logging for errors
const handleAIError = (error, contextName) => {
  console.error(`[AI_ERROR] Error in ${contextName}:`);
  console.error(`- Message: ${error.message}`);
  console.error(`- Name: ${error.name}`);
  console.error(`- Stack: ${error.stack}`);
  
  if (error.status) {
    console.error(`- API Status Code: ${error.status}`);
  }
  if (error.errorDetails) {
    console.error(`- Error Details: ${JSON.stringify(error.errorDetails, null, 2)}`);
  }

  let category = 'Unknown Failure';
  let friendlyMsg = 'An unexpected AI service failure occurred.';

  if (error.name === 'TimeoutError' || error.message.includes('timeout') || error.message.includes('timed out')) {
    category = 'Timeout';
    friendlyMsg = 'The Groq AI service failed to respond within the expected time window.';
  } else if (error.name === 'JSONParseError') {
    category = 'JSON parsing failure';
    friendlyMsg = 'Failed to extract structured data from Groq response.';
  } else if (error.message.includes('invalid_api_key') || error.message.includes('API key') || error.message.includes('401') || error.status === 401) {
    category = 'Invalid API key';
    friendlyMsg = 'Groq API key is invalid or unauthorized. Please check backend/.env.';
  } else if (error.message.includes('model_not_found') || error.message.includes('404') || error.status === 404) {
    category = 'Model not found';
    friendlyMsg = 'The requested Groq model was not found or is unavailable.';
  } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ENOTFOUND')) {
    category = 'Network failure';
    friendlyMsg = 'Network connectivity failure occurred while querying the Groq service.';
  }

  console.error(`- Categorized As: ${category}\n`);
  return {
    category,
    friendlyMsg,
    originalError: error,
  };
};

// Generic fetch function for Groq API
const callGroqAPI = async (prompt, systemInstruction = '') => {
  const modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      response_format: {
        type: 'json_object'
      },
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    const err = new Error(`Groq API returned status ${response.status}: ${errorText}`);
    err.status = response.status;
    try {
      const errJSON = JSON.parse(errorText);
      err.errorDetails = errJSON.error;
    } catch (_) {}
    throw err;
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
    throw new Error('Groq returned an empty response');
  }

  return data.choices[0].message.content;
};

const classifyReceiptData = async (receiptData) => {
  if (!hasGroq) {
    console.warn('Groq API client is not configured. Using local classifier.');
    return localClassify(receiptData);
  }

  const prompt = `You are a financial transaction classification service. Analyze this structured receipt data:
  ${JSON.stringify(receiptData)}
  
  Classify it into an expense record. You MUST respond with a JSON object ONLY.
  
  The field "category" MUST be exactly one of: Food, Shopping, Travel, Bills, Entertainment, Healthcare, Education, Others.
  
  Response JSON format:
  {
    "title": "Title of expense (e.g., Starbucks Coffee)",
    "category": "One of the categories above",
    "description": "Short summary of purchase details",
    "confidence": 0.95
  }`;

  logDebug('Prompt Sent to classifyReceiptData', prompt);

  try {
    const apiCall = callGroqAPI(prompt, 'You are a precise JSON assistant. Respond with JSON strictly.');
    const responseText = await withTimeout(apiCall, 7000);
    logDebug('Raw Response from classifyReceiptData', responseText);

    const parsed = parseRobustJSON(responseText);
    logDebug('Parsed JSON from classifyReceiptData', parsed);

    const validCategories = ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Others'];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = 'Others';
    }

    return {
      title: parsed.title || receiptData.merchant || 'Purchase',
      category: parsed.category,
      description: parsed.description || '',
      confidence: parsed.confidence || 0.8,
    };
  } catch (error) {
    const errorDetails = handleAIError(error, 'classifyReceiptData');
    logDebug('AI Classification Failed - Using Local Fallback', errorDetails.friendlyMsg);
    return localClassify(receiptData);
  }
};

const compileSpendingInsights = async (stats) => {
  const fallbackInsights = {
    summary: 'Analyze your weekly budget reports inside the statistics panel to maintain savings.',
    strengths: ['Continuous tracking of expense records.'],
    warnings: ['AI insights are offline. Please review your API settings inside backend/.env.'],
    recommendations: ['Maintain your manual budget updates and check monthly averages.'],
  };

  if (!hasGroq) {
    return {
      ...fallbackInsights,
      warnings: ['AI Insights offline: Groq API key is missing in backend/.env.'],
    };
  }

  const prompt = `You are an elite financial advisor. Analyze this summary stats of a user's monthly budget and spending:
  ${JSON.stringify(stats)}
  
  Create a summary, strengths, alerts/warnings, and actionable recommendations.
  You MUST respond with a JSON object ONLY.
  
  Response JSON format:
  {
    "summary": "Short paragraph summary of their monthly status",
    "strengths": [
      "Positive trend e.g. good saving rate",
      "Another highlight"
    ],
    "warnings": [
      "Budget overruns or high spending alerts",
      "Another alert"
    ],
    "recommendations": [
      "Practical saving advice 1",
      "Practical saving advice 2",
      "Practical saving advice 3"
    ]
  }`;

  logDebug('Prompt Sent to compileSpendingInsights', prompt);

  try {
    const apiCall = callGroqAPI(prompt, 'You are an elite financial advisor. Respond with JSON strictly.');
    const responseText = await withTimeout(apiCall, 7000);
    logDebug('Raw Response from compileSpendingInsights', responseText);

    const parsed = parseRobustJSON(responseText);
    logDebug('Parsed JSON from compileSpendingInsights', parsed);

    return {
      summary: parsed.summary || fallbackInsights.summary,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : fallbackInsights.strengths,
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : fallbackInsights.warnings,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : fallbackInsights.recommendations,
    };
  } catch (error) {
    const errorDetails = handleAIError(error, 'compileSpendingInsights');
    logDebug('AI Insights Failed - Compiling Fallback Data', errorDetails.friendlyMsg);
    
    return {
      ...fallbackInsights,
      warnings: [`AI Insights offline: ${errorDetails.friendlyMsg}`],
    };
  }
};

module.exports = {
  classifyReceiptData,
  compileSpendingInsights,
};
