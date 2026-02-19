from playwright.sync_api import sync_playwright, expect

def verify_dictionary_tabs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173")

            print("Waiting for page load...")
            page.wait_for_timeout(2000)

            print("Clicking Dictionary button...")
            # Target the button with the blue Book icon
            page.locator("button:has(svg.text-blue-400)").first.click()

            print("Waiting for modal...")
            modal = page.locator("role=dialog")
            modal.wait_for(state="visible")

            print("Verifying tabs...")
            # These should pass if my changes are working
            expect(page.get_by_role("tablist")).to_be_visible()
            expect(page.get_by_role("tab", name="Dictionary")).to_be_visible()
            expect(page.get_by_role("tab", name="Saved")).to_be_visible()
            expect(page.get_by_role("tab", name="Grammar")).to_be_visible()

            print("Taking screenshot...")
            page.screenshot(path="verification/dictionary_tabs.png")
            print("Done!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dictionary_tabs()
