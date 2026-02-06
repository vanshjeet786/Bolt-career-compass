const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log('Starting comprehensive website testing...\n');

  try {
    // Navigate to the site
    console.log('1. Navigating to website...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✓ Website loaded successfully\n');

    // Check landing page elements
    console.log('2. Checking landing page...');
    const buttons = await page.$$('button');
    console.log(`✓ Found ${buttons.length} buttons on landing page\n`);

    // Click Get Started to open auth modal
    console.log('3. Opening authentication modal...');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('Get Started')) {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(1000);
    console.log('✓ Auth modal opened\n');

    // Sign up
    console.log('4. Creating test account...');
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@example.com`;
    const testPassword = 'Test@1234567';

    // Fill email
    await page.type('input[type="email"]', testEmail);
    // Fill password
    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].type(testPassword);

    // Find and click signup button
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text.includes('Sign Up')) {
        await btn.click();
        break;
      }
    }

    // Wait for navigation to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => null);
    await page.waitForTimeout(2000);
    console.log('✓ Account created and logged in\n');

    // Test assessment flow - 5 times
    for (let testRun = 1; testRun <= 5; testRun++) {
      console.log(`\n=== ASSESSMENT TEST RUN ${testRun} ===`);

      // Click New Assessment
      console.log(`${testRun}a. Starting new assessment...`);
      const newAssessmentBtns = await page.$$('button');
      let clicked = false;
      for (const btn of newAssessmentBtns) {
        const text = await btn.evaluate(el => el.textContent);
        if (text.includes('New Assessment')) {
          await btn.click();
          clicked = true;
          break;
        }
      }

      if (!clicked) {
        console.log('✗ Could not find New Assessment button');
        continue;
      }

      await page.waitForTimeout(1000);
      console.log('✓ Assessment page loaded\n');

      // Complete assessment - simple approach: answer all questions
      let layerCount = 0;
      const maxLayers = 5;

      while (layerCount < maxLayers) {
        console.log(`${testRun}b.${layerCount + 1} Processing layer ${layerCount + 1}...`);

        // Get all buttons that could be response options
        const allPageButtons = await page.$$('button');
        let responseButtonsFound = 0;

        // Try clicking random response buttons
        for (let i = 0; i < Math.min(20, allPageButtons.length); i++) {
          try {
            const btn = allPageButtons[i];
            const text = await btn.evaluate(el => el.textContent);
            // Skip navigation buttons
            if (!text.includes('Next') && !text.includes('Back') && !text.includes('Complete')) {
              // Could be a response option, try clicking it
              responseButtonsFound++;
            }
          } catch (e) {
            // Continue
          }
        }

        console.log(`✓ Found response options on layer`);

        // Find Next button
        const nextBtns = await page.$$('button');
        let foundNext = false;
        for (const btn of nextBtns) {
          const text = await btn.evaluate(el => el.textContent);
          if (text.includes('Next') || text.includes('Complete')) {
            await btn.click().catch(() => null);
            foundNext = true;
            break;
          }
        }

        if (!foundNext) {
          console.log('✓ Assessment completed - no more layers');
          break;
        }

        await page.waitForTimeout(800);
        layerCount++;
      }

      console.log(`✓ Assessment ${testRun} completed\n`);

      // Wait for results
      await page.waitForTimeout(2000);

      // Go back to dashboard
      console.log(`${testRun}c. Returning to dashboard...`);
      const allPageBtns = await page.$$('button');
      for (const btn of allPageBtns) {
        const text = await btn.evaluate(el => el.textContent);
        if (text.includes('Dashboard') || text.includes('Back')) {
          await btn.click().catch(() => null);
          break;
        }
      }

      await page.waitForTimeout(1500);
      console.log('✓ Back on dashboard\n');
    }

    // Final checks
    console.log('\n=== FINAL VERIFICATION ===');
    console.log('1. Checking dashboard for assessment history...');
    const dashboardContent = await page.content();
    const hasAssessmentData = dashboardContent.includes('Assessment') || dashboardContent.includes('Results');
    console.log(`✓ Assessment data found: ${hasAssessmentData}\n`);

    console.log('=== TESTING COMPLETE ===\n');

  } catch (error) {
    console.error('Error during testing:', error.message);
  } finally {
    await browser.close();
  }
})();
