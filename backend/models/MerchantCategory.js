const mongoose = require('mongoose');

const merchantCategorySchema = new mongoose.Schema(
  {
    merchant: {
      type: String,
      required: [true, 'Merchant name is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Others'],
        message: '{VALUE} is not a valid category',
      },
    },
    confidence: {
      type: Number,
      default: 1.0,
    },
    source: {
      type: String,
      required: true,
      enum: ['ai', 'manual'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const MerchantCategory = mongoose.model('MerchantCategory', merchantCategorySchema);
module.exports = MerchantCategory;
