/**
 * SmartClaimr — OCR Routes
 *
 * POST /api/ocr/parse — accepts image upload (multer), runs Tesseract.js OCR,
 *   extracts text, applies keyword matching for category detection.
 *   Returns: { amount, date, description, merchant, category, suggestion, rawText }
 */

const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { authenticate } = require('../middleware/auth');
const {
  extractDataFromText,
  generateOcrSuggestion,
} = require('../services/aiSuggestions');

const router = express.Router();

// All OCR routes require authentication
router.use(authenticate);

// ── Multer config — memory storage (buffer, no disk writes) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Accepted: JPEG, PNG, GIF, WebP, BMP, TIFF.`));
    }
  },
});

/**
 * POST /api/ocr/parse
 *
 * Accepts a receipt image, runs OCR, extracts structured data.
 * Form field name: "receipt"
 */
router.post('/parse', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt image provided. Upload a file with field name "receipt".' });
    }

    console.log(`[OCR] Processing receipt: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB, ${req.file.mimetype})`);

    // ── Run Tesseract.js OCR ──────────────────────
    let rawText = '';
    try {
      const result = await Tesseract.recognize(req.file.buffer, 'eng', {
        logger: (info) => {
          if (info.status === 'recognizing text') {
            // Only log progress at intervals
            if (info.progress === 0 || info.progress >= 0.99) {
              console.log(`[OCR] ${info.status}: ${(info.progress * 100).toFixed(0)}%`);
            }
          }
        },
      });
      rawText = result.data.text;
    } catch (ocrErr) {
      console.error('[OCR] Tesseract error:', ocrErr.message);
      return res.status(500).json({
        error: 'OCR processing failed. Please try again or fill in details manually.',
        fallback: true,
      });
    }

    console.log(`[OCR] Extracted ${rawText.length} characters of text`);

    // ── Parse extracted text ─────────────────────
    const extracted = extractDataFromText(rawText);
    const suggestion = generateOcrSuggestion(extracted);

    res.json({
      success: true,
      extracted: {
        amount: extracted.amount,
        date: extracted.date,
        description: extracted.description,
        merchant: extracted.merchant,
        category: extracted.category,
      },
      suggestion,
      rawText: rawText.substring(0, 2000), // Limit raw text size
    });
  } catch (err) {
    console.error('[OCR] Parse error:', err.message);

    // Handle multer errors
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    res.status(500).json({ error: err.message || 'Failed to process receipt.' });
  }
});

module.exports = router;
