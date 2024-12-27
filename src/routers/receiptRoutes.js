import express from "express";
import multer from 'multer';
import paths from "../common/paths.js";
import { receiptController } from "../controllers/receiptController.js";

const router = express.Router();

const upload = multer({ 
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

/**
 * @swagger
 * /receipt/analyze:
 *   post:
 *     summary: Analyze receipt image for ingredients
 *     description: Extracts text from receipt image using OCR, then uses GPT to identify food ingredients
 *     tags: [Receipt]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - receipt
 *             properties:
 *               receipt:
 *                 type: string
 *                 format: binary
 *                 description: Receipt image file (max 5MB, supported formats - jpg, png)
 *     responses:
 *       200:
 *         description: Receipt analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ingredients:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of identified ingredients from the receipt
 *                       example: [
 *                         "Mints",
 *                         "Moon Pie",
 *                         "Altoids",
 *                         "Mix Fruit Flavor",
 *                         "Kit Kat",
 *                         "Harry Potter Beans",
 *                         "Reeses White Pump"
 *                       ]
 *                     rawText:
 *                       type: string
 *                       description: Raw OCR extracted text (for debugging)
 *                       example: "$aaes REPRINT #4383\nRICARDO KANDY KORNER\nITEM QTY PRICE TOTAL\nMints 39 5.99\nMoon Pie 1.00 2.9 2.9\n..."
 *       400:
 *         description: No file provided or invalid file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "NO_FILE"
 *                     message:
 *                       type: string
 *                       example: "No receipt image provided"
 *       500:
 *         description: Server error during analysis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "RECEIPT_ANALYSIS_ERROR"
 *                     message:
 *                       type: string
 *                       example: "Failed to analyze receipt"
 */
router.post(paths.receipt.analyze, upload.single('receipt'), receiptController.analyzeReceipt);
router.post(paths.receipt.analyzeAdvanced, upload.single('receipt'), receiptController.analyzeReceiptAdvanced);

export default router; 