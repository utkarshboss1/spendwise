const ocrService = require('../services/ocr/ocrService');
const receiptParser = require('../services/parser/receiptParser');
const aiService = require('../services/ai/aiService');
const MerchantCategory = require('../models/MerchantCategory');

const processReceiptOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt image file uploaded' });
    }

    // 1. Run cloud Mindee v2 OCR on file buffer
    const rawText = await ocrService.extractTextWithMindee(
      req.file.buffer,
      req.file.originalname || 'receipt.jpg'
    );

    // 2. Parse extracted raw text into structured data
    const parsedData = receiptParser.parseReceiptText(rawText);
    const merchantKey = parsedData.merchant.toLowerCase().trim();

    let category = 'Others';
    let confidence = parsedData.confidence || 0.5;
    let classificationSource = 'default';
    let aiTitle = parsedData.merchant;
    let aiDescription = parsedData.items.length > 0
      ? `Purchased: ${parsedData.items.slice(0, 3).join(', ')}${parsedData.items.length > 3 ? '...' : ''}`
      : 'Auto-extracted from receipt';

    if (merchantKey && merchantKey !== 'unknown merchant') {
      // 3. Check Merchant Cache
      const cachedMapping = await MerchantCategory.findOne({ merchant: merchantKey });

      if (cachedMapping) {
        category = cachedMapping.category;
        confidence = Math.max(confidence, cachedMapping.confidence);
        classificationSource = 'cache';
        aiTitle = parsedData.merchant;
        aiDescription = `Categorized via cached merchant rules (${cachedMapping.source})`;
      } else {
        // 4. Call AI Service for smart classification
        const classification = await aiService.classifyReceiptData({
          merchant: parsedData.merchant,
          amount: parsedData.amount,
          items: parsedData.items,
        });

        if (classification) {
          category = classification.category || 'Others';
          confidence = Math.max(confidence, classification.confidence || 0.8);
          classificationSource = 'ai';
          aiTitle = classification.title || aiTitle;
          aiDescription = classification.description || aiDescription;

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
        confidence: parsedData.confidence,
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
    res.status(500).json({
      message: error.message || 'Error processing receipt image with Mindee OCR',
    });
  }
};

module.exports = {
  processReceiptOCR,
};
