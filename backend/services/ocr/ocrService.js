const Tesseract = require('tesseract.js');

const extractTextFromBuffer = async (buffer) => {
  try {
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
    return text;
  } catch (error) {
    console.error(`OCR Extraction Error: ${error.message}`);
    throw new Error('Failed to extract text from receipt image');
  }
};

module.exports = {
  extractTextFromBuffer,
};
