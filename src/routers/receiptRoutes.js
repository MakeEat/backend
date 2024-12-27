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
 * /receipt/analyze:
 *   post:
 *     summary: Analyze receipt image using basic OCR
 *     description: Extracts text from receipt image using Tesseract OCR, then uses GPT to identify food ingredients
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
 *                       example: ["Mints", "Moon Pie", "Altoids", "Kit Kat"]
 *                     rawText:
 *                       type: string
 *                       description: Raw OCR extracted text
 *                       example: "ITEM QTY PRICE\nMints 1 5.99\nMoon Pie 2 3.98\nAltoids 1 2.99\nKit Kat 1 1.99"
 *                     ocrType:
 *                       type: string
 *                       description: Type of OCR used
 *                       example: "tesseract"
 *       400:
 *         description: Invalid request
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
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /receipt/analyze/advanced:
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
 *                       example: ["Mints", "Moon Pie", "Altoids", "Kit Kat"]
 *                     rawText:
 *                       type: string
 *                       description: Raw OCR extracted text
 *                       example: "ITEM QTY PRICE\nMints 1 5.99\nMoon Pie 2 3.98\nAltoids 1 2.99\nKit Kat 1 1.99"
 *                     ocrType:
 *                       type: string
 *                       description: Type of OCR used
 *                       example: "advanced"
 *       400:
 *         description: Invalid request
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
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "RECEIPT_ANALYSIS_ERROR"
 *             message:
 *               type: string
 *               example: "Failed to analyze receipt"
 */

router.post(paths.receipt.analyze, upload.single('receipt'), receiptController.analyzeReceipt);
router.post(paths.receipt.analyzeAdvanced, upload.single('receipt'), receiptController.analyzeReceiptAdvanced);

export default router; 