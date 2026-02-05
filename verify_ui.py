from playwright.sync_api import sync_playwright
import os
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to landing page
        page.goto("http://localhost:3000")
        time.sleep(2) # wait for animations

        # Create verification dir if not exists
        os.makedirs("/home/jules/verification", exist_ok=True)

        # Screenshot landing page
        page.screenshot(path="/home/jules/verification/landing_page.png", full_page=True)
        print("Landing page screenshot saved.")

        # Click Get Started to open modal
        page.click("text=Get Started")
        time.sleep(1) # wait for modal

        # Screenshot modal
        page.screenshot(path="/home/jules/verification/auth_modal.png")
        print("Auth modal screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
