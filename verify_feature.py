from playwright.sync_api import sync_playwright

def test_call_screen():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")

        # Wait for the buttons to be rendered
        page.wait_for_selector('button[aria-label="Mute microphone"]')
        page.wait_for_selector('button[aria-label="End call"]')

        # Focus the mic button to demonstrate focus-visible
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")

        page.screenshot(path="verification/verification.png")
        browser.close()

if __name__ == "__main__":
    test_call_screen()
