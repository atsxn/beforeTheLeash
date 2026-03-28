import pandas as pd
from datetime import datetime
from food_price_scraper import DogFoodScraper

def main():
    # 1. เรียกใช้งาน Scraper
    scraper = DogFoodScraper()
    print("เริ่มดึงข้อมูลจาก PCG...")
    
    # ดึงข้อมูล (ปรับ max_pages ได้ตามต้องการ)
    scraped_data = scraper.scrape_pcg(max_pages=2) 
    
    if not scraped_data:
        print("ไม่พบข้อมูลให้บันทึก")
        return

    print(f"ดึงข้อมูลสำเร็จ {len(scraped_data)} รายการ กำลังสร้างไฟล์ Excel...")

    # 2. แปลงข้อมูลให้อยู่ในรูปแบบตารางของ Pandas (DataFrame)
    df = pd.DataFrame(scraped_data)

    # (ทางเลือก) จัดเรียงคอลัมน์ให้สวยงามตามต้องการ
    # df = df[['product_name', 'brand', 'price_thb', 'weight_kg', 'price_per_kg', 'source_url']]

    # 3. สร้างชื่อไฟล์อัตโนมัติ (ใส่วันที่และเวลาเพื่อไม่ให้ไฟล์ซ้ำกัน)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"pcg_dog_food_{timestamp}.xlsx"

    # 4. บันทึกเป็นไฟล์ Excel
    # index=False คือการบอกว่าไม่ต้องเอาตัวเลขลำดับแถว (0, 1, 2...) ใส่ลงไปใน Excel ด้วย
    df.to_excel(filename, index=False, engine='openpyxl')
    
    print(f"บันทึกข้อมูลลงไฟล์ '{filename}' เรียบร้อยแล้ว! 🎉")

if __name__ == "__main__":
    main()