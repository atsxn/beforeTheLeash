import re
import json
from datetime import datetime
from playwright.sync_api import sync_playwright

def extract_weight_kg(product_name):
    """Attempts to find weight in kg or grams from the product title (English & Thai)."""
    match = re.search(r'(\d+(?:\.\d+)?)\s*(kg|g|กก|กรัม)', product_name.lower())
    if match:
        value = float(match.group(1))
        unit = match.group(2)
        if unit in ['g', 'กรัม']:
            return value / 1000.0  
        return value
    return None

def scrape_pcg_to_json():
    search_url = "https://pcgshoponline.com/categories/Dog-Food"
    scraped_data = [] 

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print(f"Navigating to {search_url}...")
        page.goto(search_url)
        
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(3000) 
        
        # --- NEW SELECTORS APPLIED HERE ---
        # Using a broader Playwright selector to find elements that CONTAIN the title
        product_card_selector = 'div:has(div.line-clamp-3)' 
        title_selector = 'div.line-clamp-3 a'    
        price_selector = 'span.text-pcgRed span.text-xl'          
        # ----------------------------------
        
        try:
            page.wait_for_selector(title_selector, timeout=10000) 
            # Find all cards on the page
            items = page.locator(product_card_selector).all()
            print(f"Found {len(items)} items. Parsing data...")
        except Exception as e:
            print(f"Could not find cards on the page. Error: {e}")
            browser.close()
            return

        for item in items:
            try:
                # 1. Name
                name_element = item.locator(title_selector).first
                product_name = name_element.inner_text().strip() if name_element.count() > 0 else "Unknown"
                
                # 2. Price
                price_element = item.locator(price_selector).first
                if price_element.count() > 0:
                    price_str = price_element.inner_text().replace(',', '').replace('฿', '').strip()
                    if '-' in price_str:
                        price_str = price_str.split('-')[0].strip()
                    price_thb = float(price_str)
                else:
                    continue 

                # 3. URL
                if name_element.count() > 0:
                    href = name_element.get_attribute('href')
                    if href: 
                        source_url = href if href.startswith('http') else "https://pcgshoponline.com" + href
                    else:
                        source_url = None
                else:
                    source_url = None

                # 4. Weight & Calculations
                weight_kg = extract_weight_kg(product_name)
                price_per_kg = round(price_thb / weight_kg, 2) if weight_kg else None

                # Append to list
                scraped_data.append({
                    "product_name": product_name[:255],
                    "brand": "PCG", 
                    "price_thb": price_thb,
                    "weight_kg": weight_kg,
                    "price_per_kg": price_per_kg,
                    "source_url": source_url,
                    "scraped_at": datetime.now().isoformat() 
                })

            except Exception as e:
                print(f"Error parsing an item: {e}")

        browser.close()

    filename = 'pcg_dog_food_data.json'
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(scraped_data, f, ensure_ascii=False, indent=4) 
    
    print(f"Successfully saved {len(scraped_data)} items to {filename}")

if __name__ == "__main__":
    scrape_pcg_to_json()