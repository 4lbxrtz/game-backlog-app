import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { Builder, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import 'chromedriver';

const TIMEOUT = 60000;

describe('End-to-End Tests', () => {
  let driver;

  // --- HELPER FUNCTION ---
  // We call this in tests that need to be logged in first
  async function loginUser(driver) {
    await driver.get("http://localhost:5173/login");
    const email = await driver.wait(until.elementLocated(By.id("email")), 10000);
    await email.sendKeys("prueba@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("123456789");
    await driver.findElement(By.css(".btn-login")).click();
    
    // Crucial: Wait until we are actually on the dashboard before returning
    await driver.wait(until.urlContains("/dashboard"), 10000);
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
      try {
        await driver.quit();
      } catch (e) {
        console.error(e);
      }
    }
  });

  it('register', async function() {
    await driver.get("http://localhost:5173/register")
    await driver.findElement(By.id("username")).sendKeys("prueba")
    await driver.findElement(By.id("email")).sendKeys("prueba@gmail.com")
    await driver.findElement(By.id("password")).sendKeys("123456789")
    await driver.findElement(By.id("confirmPassword")).sendKeys("123456789")
    await driver.findElement(By.id("terms")).click()
    await driver.findElement(By.css(".btn-register")).click()
  })
  // Test 1: Explicitly tests the login flow
  it('login', async () => {
    await driver.get("http://localhost:5173/login");
    const emailInput = await driver.wait(until.elementLocated(By.id("email")), 10000);
    await emailInput.sendKeys("prueba@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("123456789");
    await driver.findElement(By.css(".btn-login")).click();
    
    // Verify we landed on dashboard
    await driver.wait(until.urlContains("/dashboard"), 10000);
  }, TIMEOUT);

  // Test 2: Public page (likely doesn't need login)
  it('searchGame', async () => {
    await driver.get("http://localhost:5173/search");
    
    const searchInput = await driver.wait(until.elementLocated(By.id("q")), 10000);
    await searchInput.sendKeys("Ricky Raccoon");
    await driver.findElement(By.css(".search-button")).click();
    
    const img = await driver.wait(until.elementLocated(By.xpath("//img[@alt='Ricky Raccoon']")), 10000);
    await img.click();
    
    const description = await driver.wait(until.elementLocated(By.css(".game-description")), 10000);
    expect(await description.getText()).toBe("Little Ricky Raccoon joins his grandpa's treasure hunt at the Amazon River!");
  }, TIMEOUT);

  // Test 3: Requires Auth -> Calls loginUser() first
  it('addGame', async () => {
    // 1. Log in first!
    await loginUser(driver);

    // 2. Go to dashboard and click Add
    await driver.get("http://localhost:5173/dashboard");
    const addBtn = await driver.wait(until.elementLocated(By.css(".add-button")), 10000);
    await addBtn.click();
    
    // 3. Search for Zelda
    const searchInput = await driver.wait(until.elementLocated(By.id("q")), 10000);
    await searchInput.sendKeys("zelda");
    await driver.findElement(By.css(".search-button")).click();
    
    // 4. Click the first game result
    const gameCard = await driver.wait(until.elementLocated(By.css(".game-card:nth-child(1) img")), 10000);
    // Use JavaScript click (more reliable for images inside cards)
    await driver.executeScript("arguments[0].click();", gameCard);
    
    // 5. Select the status
    // OLD BROKEN LINE: await driver.findElement(By.css(".active")).click();
    
    // NEW FIX: Find the button by the TEXT written on it.
    // If the button says "Playing" or something else, change 'Active' below to that word.
    const statusBtn = await driver.wait(
      until.elementLocated(By.xpath("//*[text()='Jugando']")), 
      10000
    );
    await statusBtn.click();
    
    // 6. Go back to dashboard and verify
    await driver.get("http://localhost:5173/dashboard");
    
    // Wait for the dashboard grid to load
    await driver.wait(until.elementLocated(By.css(".game-title")), 10000);
    
    // Verify the game is there
    const savedGame = await driver.findElement(By.xpath("//div[contains(@class,'game-card')]//*[contains(text(), 'Skyward Sword')]"));
    expect(await savedGame.getText()).toBe("The Legend of Zelda: Skyward Sword");
  }, TIMEOUT);

  // Test 4: Requires Auth -> Calls loginUser() first
  it('logout', async () => {
    // 1. Log in first!
    await loginUser(driver);

    const avatar = await driver.wait(until.elementLocated(By.css(".avatar")), 10000);
    await avatar.click();
    
    // Optional: Verify we are back at login
    await driver.wait(until.urlContains("/login"), 10000);
  }, TIMEOUT);
});