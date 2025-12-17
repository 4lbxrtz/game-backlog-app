import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { Builder, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import 'chromedriver';

const BASE_URL = "http://127.0.0.1:5173";
const TIMEOUT = 60000;

describe('End-to-End Tests', () => {
  let driver;

  // Helper to reuse login logic
  async function loginUser(driver) {
    await driver.get(`${BASE_URL}/login`);
    const email = await driver.wait(until.elementLocated(By.id("email")), 10000);
    await email.sendKeys("tests@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("123456789");
    
    const loginBtn = await driver.findElement(By.css(".btn-login"));
    // Use JS click for reliability
    await driver.executeScript("arguments[0].click();", loginBtn);
    
    await driver.wait(until.urlContains("/dashboard"), 15000);
  }

  beforeEach(async () => {
    const options = new Options();
    options.setChromeBinaryPath('/usr/bin/google-chrome'); 
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }, TIMEOUT);

  afterEach(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('login', async () => {
    await loginUser(driver);
    const url = await driver.getCurrentUrl();
    expect(url).toContain("/dashboard");
  }, TIMEOUT);

  it('searchGame', async () => {
    await loginUser(driver);

    // 1. Click "Añadir" button
    const addBtn = await driver.wait(until.elementLocated(By.css(".nav-add-btn")), 10000);
    await driver.executeScript("arguments[0].click();", addBtn);

    // 2. Type "Elden Ring"
    const searchInput = await driver.wait(until.elementLocated(By.id("q")), 10000);
    await searchInput.sendKeys("Elden Ring");

    // 3. WAIT for the specific text "Elden Ring" to appear in results
    // This ensures we don't click a "Trending" game by mistake before search finishes
    const gameTitleElement = await driver.wait(
      until.elementLocated(By.xpath("//div[contains(@class, 'game-title') and contains(text(), 'Elden Ring')]")), 
      15000
    );

    // 4. Find the parent card of that title
    const gameCard = await gameTitleElement.findElement(By.xpath("./.."));
    
    // 5. IMPORTANT: Find the LINK (<a>) tag inside that card.
    // In your code, only the Image is wrapped in <Link>, not the title.
    const gameLink = await gameCard.findElement(By.css("a"));
    
    // 6. Click the link using JS to avoid interception issues
    await driver.executeScript("arguments[0].click();", gameLink);

    // 7. Verify URL changed
    await driver.wait(until.urlContains("/game/"), 15000);
  }, TIMEOUT);

  it('logout', async () => {
    await loginUser(driver);

    // 1. Click Avatar
    const avatar = await driver.wait(until.elementLocated(By.css(".nav-avatar")), 10000);
    await driver.executeScript("arguments[0].click();", avatar);

    // 2. Wait for Dropdown Animation (0.2s in CSS)
    // Small sleep ensures the element is strictly interactive
    await driver.sleep(500); 

    // 3. Click Logout Button
    const logoutBtn = await driver.wait(until.elementLocated(By.css(".logout")), 10000);
    await driver.executeScript("arguments[0].click();", logoutBtn);

    // 4. Verify Redirect
    await driver.wait(until.urlContains("/login"), 15000);
  }, TIMEOUT);
});