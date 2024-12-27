import { logInfo, logError } from '../middlewares/logger.js';
import fs from 'fs/promises';
import openai from '../config/openai.js';
import axios from 'axios';
import FormData from 'form-data';
import { createWorker } from 'tesseract.js';

export const receiptController = {
    // 새로운 기본 OCR (EasyOCR + Tesseract)
    analyzeReceipt: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'NO_FILE',
                        message: 'No receipt image provided'
                    }
                });
            }

            logInfo(`Analyzing receipt image with Advanced OCR: ${req.file.filename}`);

            // FastAPI 서버 호출하여 텍스트 영역 감지
            const formData = new FormData();
            const fileBuffer = await fs.readFile(req.file.path);
            formData.append('file', fileBuffer, { filename: req.file.originalname });

            const ocrResponse = await axios.post('http://localhost:5001/ocr', formData, {
                headers: {
                    ...formData.getHeaders(),
                }
            });

            if (!ocrResponse.data.success) {
                throw new Error(ocrResponse.data.error);
            }

            // 감지된 영역이 없는 경우
            if (ocrResponse.data.regions === 0) {
                throw new Error('No text regions detected in the image');
            }

            // Base64 이미지를 파일로 저장
            const imageBuffer = Buffer.from(ocrResponse.data.image, 'base64');
            await fs.writeFile(`${req.file.path}_regions.png`, imageBuffer);

            // Tesseract로 텍스트 인식
            const worker = await createWorker();
            const { data: { text } } = await worker.recognize(`${req.file.path}_regions.png`, {
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,$ '
            });
            await worker.terminate();

            logInfo(`Advanced OCR Result: ${text}`);

            // GPT 분석 및 결과 반환
            const ingredients = await analyzeWithGPT(text);

            // 임시 파일들 삭제
            await fs.unlink(req.file.path);
            await fs.unlink(`${req.file.path}_regions.png`);

            return res.status(200).json({
                success: true,
                data: {
                    ingredients,
                    rawText: text,
                    ocrType: 'advanced'
                }
            });

        } catch (error) {
            handleError(error, req, res);
        }
    },

    // Legacy OCR (Tesseract only)
    analyzeLegacyReceipt: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'NO_FILE',
                        message: 'No receipt image provided'
                    }
                });
            }

            logInfo(`Analyzing receipt image with Tesseract: ${req.file.filename}`);

            // Tesseract OCR 처리
            const worker = await createWorker();
            const { data: { text } } = await worker.recognize(req.file.path);
            await worker.terminate();

            logInfo(`Tesseract OCR Result: ${text}`);

            // GPT 분석 및 결과 반환
            const ingredients = await analyzeWithGPT(text);

            // 임시 파일 삭제
            await fs.unlink(req.file.path);

            return res.status(200).json({
                success: true,
                data: {
                    ingredients,
                    rawText: text,
                    ocrType: 'tesseract'
                }
            });

        } catch (error) {
            handleError(error, req, res);
        }
    }
};

// GPT 분석 헬퍼 함수
async function analyzeWithGPT(text) {
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are an expert at identifying food ingredients from receipt text.
                         Analyze the following receipt text and identify all food ingredients.
                         Return ONLY a JSON array of ingredients in both Korean and English if possible.
                         Format: ["ingredient1", "ingredient2", ...]`
            },
            {
                role: "user",
                content: text
            }
        ],
        temperature: 0.3
    });

    return JSON.parse(completion.choices[0].message.content);
}

// 에러 처리 헬퍼 함수
async function handleError(error, req, res) {
    logError(`Receipt analysis error: ${error.message}`);
    
    if (req.file) {
        try {
            await fs.unlink(req.file.path);
            // 영역 이미지 파일이 있다면 삭제
            const regionsPath = `${req.file.path}_regions.png`;
            await fs.access(regionsPath).then(() => fs.unlink(regionsPath)).catch(() => {});
        } catch (unlinkError) {
            logError(`Failed to delete temporary file: ${unlinkError.message}`);
        }
    }

    return res.status(500).json({
        success: false,
        error: {
            code: 'RECEIPT_ANALYSIS_ERROR',
            message: error.message
        }
    });
} 