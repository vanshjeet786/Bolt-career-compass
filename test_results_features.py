from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

        print("Starting Results Features Test...")
        page.goto("http://localhost:5173")
        page.wait_for_timeout(3000)

        try:
            page.click("text=Get Started", timeout=5000)
            page.wait_for_timeout(1000)

            email = os.environ.get("TEST_USER_EMAIL", "api_test_1775288443618@example.com")
            password = os.environ.get("TEST_USER_PASSWORD", "Test@1234567")
            page.fill('input[type="email"]', email, timeout=5000)
            page.fill('input[type="password"]', password)
            page.click("button:has-text('Sign In')")

            page.wait_for_selector("text=New Assessment", timeout=10000)
            print("Logged in successfully.")
        except Exception as e:
            print(f"Login logic failed: {e}")

        page.wait_for_timeout(3000)

        try:
            print("Looking for assessment results...")

            view_results_btns = page.locator("button:has-text('Results')").all()
            if len(view_results_btns) > 0:
                view_results_btns[0].click()
                print("Clicked 'Results' for an assessment.")

                # Wait for Results page to load
                page.wait_for_selector("text=Your Career Blueprint", timeout=10000)
                page.wait_for_timeout(2000)

                print("\n--- Testing Results Features ---")

                # Test Career Match Details
                print("  Testing Career Details...")
                try:
                    expand_btns = page.locator("button:has-text('Show More Details')").all()
                    if len(expand_btns) > 0:
                        expand_btns[0].click()
                        time.sleep(2)
                        print("  ✓ Career details expanded")
                    else:
                        print("  ✗ 'Show More Details' button not found")
                except Exception as e:
                    print(f"  ✗ Error testing Career Details: {e}")

                # Test AI Chat
                print("  Testing AI Chat...")
                try:
                    chat_toggle = page.locator("button:has-text('AI Counselor')")
                    if chat_toggle.count() > 0:
                        chat_toggle.click()
                        time.sleep(1)
                        print("  ✓ Toggled AI Chat window")

                    chat_input = page.locator("textarea[placeholder*='Ask']")
                    if chat_input.count() > 0:
                        # Ensure the component registers the change so button is enabled
                        chat_input.fill("What skills do I need for my top match?")
                        page.wait_for_timeout(500)

                        # Wait for Send button to become enabled
                        send_btn = page.locator("button:has-text('Send')").first
                        if send_btn.is_enabled():
                            send_btn.click()
                            print("  ✓ Send button clicked")
                        else:
                            # Try pressing Enter
                            chat_input.press("Enter")
                            print("  ✓ Pressed Enter")

                        time.sleep(5)
                        print("  ✓ AI Chat interaction simulated")
                    else:
                        print("  ✗ AI Chat textarea not found")
                except Exception as e:
                    print(f"  ✗ Error testing AI Chat: {e}")

            else:
                print("No 'Results' buttons found.")
        except Exception as e:
            print(f"Error viewing results: {e}")

        page.screenshot(path="results_page_final.png")
        browser.close()

if __name__ == "__main__":
    run()
