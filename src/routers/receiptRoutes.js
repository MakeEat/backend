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
 * tags:
 *   name: Receipt
 *   description: Receipt analysis and ingredient extraction
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReceiptResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             ingredients:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Mints", "Moon Pie", "Altoids Curioely Strong Mints", "Mix Fruit Flavour", "Kit Kat", "Harry Potter Beans", "Reeses White Pumpkin"]
 *             rawText:
 *               type: string
 *               example: "sases REPRINI S030\nRICARDD KNOY Kr\n752 GRAWVL E STR\nVANCOUVER, BC\nPH, 28 iB 4141\n2191007292022 Tiwe0524 PH INV0129661\nvtation 10 2  CashierAmn\nme OY PRICE TOTAL\nMints 1.00 5.9 5.9,\nMoon Pie 1.90 2.9 2.98\nAltoids Curioely Strong 1.00 5.99 5.98"
 *             ocrType:
 *               type: string
 *               enum: [advanced, tesseract]
 *               example: "advanced"
 *   responses:
 *     BadRequest:
 *       description: Invalid request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "NO_FILE"
 *                   message:
 *                     type: string
 *                     example: "No receipt image provided"
 *     ServerError:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "RECEIPT_ANALYSIS_ERROR"
 *                   message:
 *                     type: string
 *                     example: "Failed to analyze receipt"
 */

/**
 * @swagger
 * /receipt/analyze:
 *   post:
 *     summary: Analyze receipt image using advanced OCR
 *     description: Uses EasyOCR for text detection and Tesseract for text recognition, then GPT for ingredient identification
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
 *               $ref: '#/components/schemas/ReceiptResponse'
 *             example:
 *               success: true
 *               data:
 *                 ingredients: ["Mints", "Moon Pie", "Altoids Curioely Strong Mints", "Mix Fruit Flavour", "Kit Kat", "Harry Potter Beans", "Reeses White Pumpkin"]
 *                 rawText: "sases REPRINI S030\nRICARDD KNOY Kr\n752 GRAWVL E STR\nVANCOUVER, BC\nPH, 28 iB 4141\n2191007292022 Tiwe0524 PH INV0129661\nvtation 10 2  CashierAmn\nme OY PRICE TOTAL\nMints 1.00 5.9 5.9,\nMoon Pie 1.90 2.9 2.98\nAltoids Curioely Strong 1.00 5.99 5.98"
 *                 ocrType: "advanced"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(paths.receipt.analyze, upload.single('receipt'), receiptController.analyzeReceipt);

/**
 * @swagger
 * /receipt/analyze/legacy:
 *   post:
 *     summary: (Legacy) Analyze receipt image using basic OCR
 *     deprecated: true
 *     description: Uses Tesseract OCR for text recognition (legacy method)
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
 *                 description: Receipt image file (max 5MB)
 *     responses:
 *       200:
 *         description: Receipt analyzed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReceiptResponse'
 *             example:
 *               success: true
 *               data:
 *                 ingredients: ["Mints", "Moon Pie", "Altoids", "Mix Fruit Flavor", "Kit Kat", "Harry Potter Beans", "Reeses White Pump"]
 *                 rawText: "$aaes REPRINT #4383\n\nRICARDO KANDY KORNER\nITEM QTY PRICE TOTAL\nMints 39 5.99\nMoon Pie 1.00 2.9 2.9\nAltoids y ) 5.9 5.9"
 *                 ocrType: "tesseract"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(paths.receipt.legacyAnalyze, upload.single('receipt'), receiptController.analyzeLegacyReceipt);

export default router; 