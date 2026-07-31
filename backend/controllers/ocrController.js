const ocrService = require('../services/ocr/ocrService');
const receiptParser = require('../services/parser/receiptParser');
const aiService = require('../services/ai/aiService');
const MerchantCategory = require('../models/MerchantCategory');

const processReceiptOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt image file uploaded' });
    }

    // 1. Run local Tesseract OCR on file buffer
    const rawText = await ocrService.extractTextFromBuffer(req.file.buffer);

    // 2. Parse raw text into structured data
    const parsedData = receiptParser.parseReceiptText(rawText);
    const merchantKey = parsedData.merchant.toLowerCase().trim();

    let category = 'Others';
    let confidence = 0.5;
    let classificationSource = 'default';
    let aiTitle = parsedData.merchant;
    let aiDescription = 'Auto-extracted from receipt';

    if (merchantKey && merchantKey !== 'unknown merchant') {
      // 3. Check Merchant Cache
      const cachedMapping = await MerchantCategory.findOne({ merchant: merchantKey });

      if (cachedMapping) {
        category = cachedMapping.category;
        confidence = cachedMapping.confidence;
        classificationSource = 'cache';
        aiTitle = parsedData.merchant;
        aiDescription = `Categorized via cached merchant rules (${cachedMapping.source})`;
      } else {
        // 4. Call AI Service for classification
        const classification = await aiService.classifyReceiptData({
          merchant: parsedData.merchant,
          amount: parsedData.amount,
          items: parsedData.items,
        });

        category = classification.category;
        confidence = classification.confidence;
        classificationSource = 'ai';
        aiTitle = classification.title;
        aiDescription = classification.description;

        // Save classification outcome to cache
        try {
          await MerchantCategory.findOneAndUpdate(
            { merchant: merchantKey },
            {
              category,
              confidence,
              source: 'ai',
            },
            { upsert: true, new: true }
          );
        } catch (dbErr) {
          console.error(`Failed to save merchant cache: ${dbErr.message}`);
        }
      }
    }

    // Return merged details for frontend to auto-populate the form
    res.json({
      success: true,
      rawText,
      parsedData: {
        merchant: parsedData.merchant,
        date: parsedData.date,
        amount: parsedData.amount,
        items: parsedData.items,
        tax: parsedData.tax,
      },
      classification: {
        title: aiTitle,
        category,
        description: aiDescription,
        confidence,
        source: classificationSource,
      },
    });
  } catch (error) {
    console.error(`Receipt Processing Error: ${error.message}`);
    res.status(500).json({ message: error.message || 'Error processing receipt image' });
  }
};

module.exports = {
  processReceiptOCR,
};
