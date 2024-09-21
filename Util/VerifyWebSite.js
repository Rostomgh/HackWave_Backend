var https = require("https");
// var launch = require("puppeteer").launch;
var axios = require("axios");
var PNG = require("pngjs").PNG;
var resemble = require("resemblejs");
const puppeteer = require("puppeteer-core");
const { connect } = require("puppeteer-real-browser");
const UserAgent = require("user-agents");

async function instance() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage();

  await page.setUserAgent(new UserAgent().random().toString());

  // const { browser, page } = await connect({
  //   headless: false,
  //   customConfig: {},
  //   turnstile: true,
  //   connectOption: {},
  //   disableXvfb: false,
  //   ignoreAllFlags: false,
  // });

  page.setDefaultNavigationTimeout(0);

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  // Navigate to the login page
  await page.goto("https://www.naviguih.com/SignIn", {
    waitUntil: "networkidle2",
    timeout: 60000, // Increase timeout to 60 seconds
  });

  // Check for Cloudflare challenge
  const cloudflareSelector = "#cf-challenge-running";
  const hasCloudfareChallenge = await page.evaluate((sel) => {
    return document.querySelector(sel) !== null;
  }, cloudflareSelector);

  if (hasCloudfareChallenge) {
    console.log("Cloudflare challenge detected. Attempting to solve...");

    await page.waitForFunction(
      () => {
        return document.querySelector("#cf-challenge-running") === null;
      },
      { timeout: 30000 }
    );

    console.log("Cloudflare challenge appears to be solved.");
  }

  await page.type("#email", "anis.cheklat@satim.dz");
  await page.type("#password", "Anis.Cheklat123@");

  await Promise.all([
    page.click("button"),
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
  ]);

  console.log("Login process completed.");

  return { page, browser };
}

async function payPage() {
  const { page, browser } = await instance();
  try {
    console.log("Navigating to plans page...");
    await page.goto("https://www.naviguih.com/plans", {
      waitUntil: "networkidle2",
    });

    console.log("Waiting for 'Get Started' link...");
    await page.waitForSelector('a[href="/addons"]', {
      visible: true,
      timeout: 30000,
    });

    console.log("Clicking 'Get Started' link...");
    await Promise.all([
      page.click('a[href="/addons"]'),
      page
        .waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 })
        .catch(() => console.log("Navigation timeout, continuing...")),
    ]);

    console.log("Checking if we've reached the addons page...");
    await page
      .waitForFunction(() => window.location.pathname === "/addons", {
        timeout: 10000,
      })
      .catch(() => console.log("Did not reach /addons page, continuing..."));

    const captchaResult = await detectCaptcha(page);
    const termsInputResult = await detectTermsInput(page);
    const isClear = await isFontClear(page);

    return {
      page,
      browser,
      captchaResult,
      termsInputResult,
      isClear,
    };
  } catch (err) {
    console.error("Error in payPage:", err);
    await page.screenshot({
      path: `error-screenshot-${Date.now()}.png`,
      fullPage: true,
    });
    throw err;
  }
}

async function detectCaptcha(page) {
  const checkForCaptcha = async () => {
    try {
      const pageContent = await page.content();
      let allContent = pageContent;
      const scriptSrcs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("script[src]")).map(
          (script) => script.src
        );
      });

      for (const src of scriptSrcs) {
        const scriptContent = await page.evaluate(async (url) => {
          const response = await fetch(url);
          return response.text();
        }, src);
        allContent += scriptContent;
      }

      const captchaTypes = [
        { name: "reCAPTCHA", regex: /grecaptcha|google\.com\/recaptcha/i },
        { name: "hCaptcha", regex: /hcaptcha\.com|\.hcaptcha\./i },
        {
          name: "Cloudflare",
          regex: /challenges\.cloudflare\.com\/turnstile/i,
        },
        { name: "FunCaptcha", regex: /arkoselabs\.com|funcaptcha/i },
        { name: "GeeTest", regex: /geetest\.com/i },
        { name: "KeyCaptcha", regex: /keycaptcha\.com/i },
        { name: "BotDetect", regex: /botdetect\.com/i },
      ];

      for (const type of captchaTypes) {
        if (type.regex.test(allContent)) {
          return { detected: true, type: type.name };
        }
      }

      const captchaKeywords = [
        "captcha",
        "human verification",
        "are you human",
        "prove you're not a robot",
        "security check",
        "bot protection",
        "verify your identity",
      ];
      const keywordRegex = new RegExp(captchaKeywords.join("|"), "i");
      if (keywordRegex.test(allContent)) {
        return { detected: true, type: "Unknown CAPTCHA (keyword detected)" };
      }

      return { detected: false, type: null };
    } catch (error) {
      console.error("Error detecting captcha:", error.message);
      return {
        detected: false,
        type: null,
        error: `Failed to analyze the page: ${error.message}`,
      };
    }
  };
  return checkForCaptcha();
}

async function detectTermsInput(page) {
  try {
    const termsInputExists = await page.evaluate(() => {
      const inputs = document.querySelectorAll(
        'input[type="checkbox"], input[type="radio"]'
      );

      for (const input of inputs) {
        let label = input.labels[0] || input.parentElement.children[1];

        if (!label) {
          const parent = input.parentElement;
          const siblings = parent.childNodes;
          for (const sibling of siblings) {
            if (
              sibling.nodeType === Node.TEXT_NODE &&
              sibling.textContent.trim()
            ) {
              label = { textContent: sibling.textContent };
              break;
            }
          }
        }

        if (label) {
          const labelText = label.textContent.toLowerCase();
          const termsKeywords = [
            // English
            "terms",
            "conditions",
            "agree",
            "accept",
            "conditions",
            "termes",
            "accepte",
            "j'accepte",
            "شروط",
            "أحكام",
            "أوافق",
            "أقبل",
          ];

          if (termsKeywords.some((keyword) => labelText.includes(keyword))) {
            return true;
          }
        }
      }

      return false;
    });

    if (termsInputExists) {
      return {
        detected: true,
        message: "Terms and conditions input found",
      };
    }

    return {
      detected: false,
      message: "Terms and conditions input not found",
    };
  } catch (error) {
    console.error("Error detecting terms input:", error.message);
    return {
      detected: false,
      message: `Failed to analyze the page: ${error.message}`,
      error: error.message,
    };
  }
}

async function checkSSL(url) {
  async function checkUrl(url) {
    try {
      const response = await axios.get(url);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
  const isUrlCorrect = await checkUrl(url);
  if (isUrlCorrect) {
    return new Promise((resolve) => {
      if (url.startsWith("https")) {
        https
          .get(url, (res) => {
            resolve({ isValid: true, message: "SSL verified" });
          })
          .on("error", (e) => {
            resolve({ isValid: false, message: "SSL verification failed" });
          });
      } else {
        resolve({ isValid: false, message: "URL is not using HTTPS" });
      }
    });
  } else {
    return { isValid: false, message: "URL is not correct" };
  }
}

async function isFontClear(page) {
  try {
    const fontStyle = await page.evaluate(() => {
      const element = window.getComputedStyle(
        document.querySelector(
          "p.text-\\[20px\\].font-semibold.font-poppins.text-naviguih-black.ml-4"
        )
      );
      return {
        fontWeight: element.fontWeight,
        fontSize: element.fontSize,
        isClear: element.fontWeight >= "500" && element.fontSize === "20px",
      };
    });

    if (fontStyle) {
      return { success: true, fontStyle };
    } else {
      return { success: false, message: "amount not found on the page" };
    }
  } catch (error) {
    console.error("Error getting total amount:", error.message);
    return {
      success: false,
      message: `Failed to get total amount: ${error.message}`,
    };
  }
}

async function verifyWebsite(req, res) {
  const { url } = req.body;
  try {
    let CIBmatch;
    await resemble("https://epayement.elit.dz/ressources/img/carte_CIB.jpg")
      .compareTo("https://www.naviguih.com/assets/cib_logo-BMnQXW-y.png")
      .scaleToSameSize()
      .onComplete((e) => {
        CIBmatch = e.misMatchPercentage;
      });
    const { page, browser, captchaResult, isClear } = await payPage();

    console.log("Detecting terms input...");
    const termsInputResult = await detectTermsInput(page);
    console.log("Terms input detection result:", termsInputResult);

    console.log("Checking SSL...");
    const isSSL = await checkSSL(url);
    console.log("SSL check result:", isSSL);

    // await browser.close();

    res.json({
      isCaptcha: captchaResult,
      isSSL,
      isConditions: termsInputResult,
      isClear,
      CIBLogoMatch: CIBmatch > 40 ? false : true,
    });
  } catch (error) {
    console.error("Error in verifyWebsite:", error);
    res
      .status(500)
      .json({ error: "An error occurred during website verification" });
  }
}

module.exports = { verifyWebsite };
