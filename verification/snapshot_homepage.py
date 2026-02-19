from playwright.sync_api import sync_playwright

def snapshot_homepage():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173")
            page.wait_for_timeout(3000)

            print("Taking homepage screenshot...")
            page.screenshot(path="verification/homepage.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    snapshot_homepage()
