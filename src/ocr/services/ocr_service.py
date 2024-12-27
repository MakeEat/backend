import easyocr
import numpy as np
import cv2
from PIL import Image
import io
import base64
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        self.reader = easyocr.Reader(['en'])
        
    async def process_image(self, image_bytes):
        try:
            # 이미지 로드
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # 이미지 전처리
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # 대비 향상
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(denoised)
            
            # 이진화
            _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            # EasyOCR로 텍스트 영역만 감지
            regions = self.reader.readtext(
                binary,
                paragraph=False,
                detail=1,
                min_size=10,
                text_threshold=0.2,
                width_ths=0.7,
                height_ths=0.7
            )
            
            logger.info(f"Found {len(regions)} text regions")
            
            # 원본 이미지 크기의 빈 이미지 생성
            result = np.full_like(binary, 255)  # 흰색 배경
            
            # 감지된 텍스트 영역만 복사
            for region in regions:
                bbox = np.array(region[0], np.int32)
                padding = 5
                x_min, y_min = bbox.min(axis=0)
                x_max, y_max = bbox.max(axis=0)
                
                x_min = max(0, int(x_min - padding))
                y_min = max(0, int(y_min - padding))
                x_max = min(binary.shape[1], int(x_max + padding))
                y_max = min(binary.shape[0], int(y_max + padding))
                
                # 원본 영역 복사
                region_img = binary[y_min:y_max, x_min:x_max]
                result[y_min:y_max, x_min:x_max] = region_img
            
            # PIL Image로 변환
            result_pil = Image.fromarray(result)
            
            # 이미지를 base64로 인코딩
            img_byte_arr = io.BytesIO()
            result_pil.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            img_base64 = base64.b64encode(img_byte_arr).decode('utf-8')
            
            return {
                "image": img_base64,
                "regions": len(regions)
            }
            
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            raise