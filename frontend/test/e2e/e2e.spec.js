import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { Builder, By, until } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import 'chromedriver';

// Use 127.0.0.1 to match your CI setup
const BASE_URL = "http://127.0.0.1:5173";
const TIMEOUT = 60000;

describe('End-to-End Tests', () => {
  let driver;

  // --- HELPER FUNCTION ---
  async function loginUser(driver) {
    await driver.get(`${BASE_URL}/login`);
    const email = await driver.wait(until.elementLocated(By.id("email")), 10000);
    await email.sendKeys("prueba@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("123456789");
    await driver.findElement(By.css(".btn-login")).click();
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

  it('login', async () => {
    await driver.get(`${BASE_URL}/login`);
    const emailInput = await driver.wait(until.elementLocated(By.id("email")), 10000);
    await emailInput.sendKeys("prueba@gmail.com");
    await driver.findElement(By.id("password")).sendKeys("123456789");
    await driver.findElement(By.css(".btn-login")).click();
    await driver.wait(until.urlContains("/dashboard"), 10000);
  }, TIMEOUT);

  it('searchGame', async () => {
    await driver.get(`${BASE_URL}/search`);
    
    const searchInput = await driver.wait(until.elementLocated(By.id("q")), 10000);
    await searchInput.sendKeys("Ricky Raccoon");
    await driver.findElement(By.css(".search-button")).click();
    
    const img = await driver.wait(until.elementLocated(By.xpath("//img[@alt='Ricky Raccoon']")), 10000);
    await img.click();
    
    const description = await driver.wait(until.elementLocated(By.css(".game-description")), 10000);
    expect(await description.getText()).toBe("Little Ricky Raccoon joins his grandpa's treasure hunt at the Amazon River!");
  }, TIMEOUT);

  // it('addGame', async () => {
  //   await loginUser(driver);

  //   await driver.get(`${BASE_URL}/dashboard`);
    
  //   // FIX 1: Wait for element to be visible, not just located
  //   const addBtn = await driver.wait(until.elementLocated(By.css(".add-button")), 30000);
  //   await driver.wait(until.elementIsVisible(addBtn), 30000);

  //   // FIX 2: Use JavaScript Click (More reliable in CI/Headless)
  //   await driver.executeScript("arguments[0].click();", addBtn);
    
  //   // Now wait for the search input
  //   const searchInput = await driver.wait(until.elementLocated(By.id("q")), 30000);
  //   await searchInput.sendKeys("zelda");
  //   await driver.findElement(By.css(".search-button")).click();
    
  //   const gameCard = await driver.wait(until.elementLocated(By.css(".game-card:nth-child(1) img")), 30000);
  //   await driver.executeScript("arguments[0].click();", gameCard);
    
  //   // Wait for the status button (Using the text approach we fixed earlier)
  //   const statusBtn = await driver.wait(
  //     until.elementLocated(By.xpath("//*[text()='Jugando']")), 
  //     30000
  //   );
  //   // Use JS Click here too just to be safe
  //   await driver.executeScript("arguments[0].click();", statusBtn);
    
  //   await driver.get(`${BASE_URL}/dashboard`);
  //   await driver.wait(until.elementLocated(By.css(".game-title")), 30000);
    
  //   const savedGame = await driver.findElement(By.xpath("//div[contains(@class,'game-card')]//*[contains(text(), 'Skyward Sword')]"));
  //   expect(await savedGame.getText()).toBe("The Legend of Zelda: Skyward Sword");
  // }, TIMEOUT);

  it('logout', async () => {
    await loginUser(driver);

    const avatar = await driver.wait(until.elementLocated(By.css(".avatar")), 10000);
    await driver.executeScript("arguments[0].click();", avatar);
    
    await driver.wait(until.urlContains("/login"), 10000);
  }, TIMEOUT);
});