const mindee = require('mindee');

const OCR_DEBUG = true;

const logOCR = (title, data) => {
  if (OCR_DEBUG) {
    console.log(`[MINDEE_OCR_DEBUG] === ${title} ===`);
    console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    console.log(`[MINDEE_OCR_DEBUG] ===========================\n`);
  }
};

let mindeeClient = null;

const getMindeeClient = () => {
  if (!mindeeClient) {
    const apiKey = process.env.MINDEE_API_KEY;
    if (!apiKey) {
      throw new Error('MINDEE_API_KEY is not configured in backend/.env');
    }
    mindeeClient = new mindee.Client({ apiKey });
  }
  return mindeeClient;
};

/**
 * Process receipt buffer using Mindee v2 OCR API
 * @param {Buffer} buffer - Image buffer from upload
 * @param {string} originalname - Original file name
 * @returns {Promise<string>} Extracted OCR text
 */
const extractTextWithMindee = async (buffer, originalname = 'receipt.jpg') => {
  try {
    const client = getMindeeClient();
    logOCR('Starting Mindee v2 OCR Processing', {
      filename: originalname,
      bufferSize: `${(buffer.length / 1024).toFixed(2)} KB`,
    });

    const inputSource = new mindee.BufferInput({
      buffer,
      filename: originalname || 'receipt.jpg',
    });

    const apiResponse = await client.enqueueAndGetResult(
      mindee.product.Ocr,
      inputSource,
      { modelId: '2831502d-acf9-4ecd-9875-1d2872b17fff' }
    );

    const pages = apiResponse?.inference?.result?.pages || [];
    const fullText = pages.map((p) => p.content || '').join('\n').trim();

    logOCR('Mindee OCR Extraction Result', {
      pageCount: pages.length,
      textLength: fullText.length,
      snippet: fullText.slice(0, 200),
    });

    return fullText;
  } catch (error) {
    console.error(`Mindee OCR Processing Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  extractTextWithMindee,
};
