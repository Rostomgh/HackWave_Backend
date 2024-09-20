import axios from "axios";
import https from "https";
import { launch } from "puppeteer";

async function instance() {
  const browser = await launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.goto("https://www.naviguih.com/SignIn", {
    waitUntil: "networkidle2",
  });
  await page.type("#email", "anis.cheklat@satim.dz");
  await page.type("#password", "Anis.Cheklat123@");
  await page.click("button");
  await page.waitForNavigation({ waitUntil: "networkidle2" });

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

import axios from "axios";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

// Function to download an image and convert it to PNG
const fetchImageAsPNG = async (url) => {
  const response = await axios({
    url,
    responseType: "arraybuffer", // Fetch image as binary data
  });

  return new Promise((resolve, reject) => {
    const png = new PNG();
    png.parse(response.data, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
};

const compareImages = async (url1, url2) => {
  try {
    const [img1, img2] = await Promise.all([
      fetchImageAsPNG(url1),
      fetchImageAsPNG(url2),
    ]);

    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );
    const matchPercentage = (
      (1 - numDiffPixels / (width * height)) *
      100
    ).toFixed(2);

    console.log(`Match percentage: ${matchPercentage}%`);
  } catch (error) {
    console.error("Error comparing images:", error);
  }
};

const imageUrl1 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzi5qtFHTEChYCjpMor06MG61eu4DgMj9oZA&s";
const imageUrl2 = "https://www.naviguih.com/assets/cib_logo-BMnQXW-y.png";

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

        // If no label is found, check for nearby text
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

export async function verifyWebsite(req, res) {
  const { url } = req.body;
  try {
    compareImages(imageUrl1, imageUrl2).then((result) => {
      console.log(result);
    });
    // const { page, browser, captchaResult, isClear } = await payPage();

    // console.log("Detecting terms input...");
    // const termsInputResult = await detectTermsInput(page);
    // console.log("Terms input detection result:", termsInputResult);

    // console.log("Checking SSL...");
    // const isSSL = await checkSSL(url);
    // console.log("SSL check result:", isSSL);

    // await browser.close();

    // res.json({
    //   isCaptcha: captchaResult,
    //   isSSL,
    //   isConditions: termsInputResult,
    //   isClear,
    // });
  } catch (error) {
    console.error("Error in verifyWebsite:", error);
    res
      .status(500)
      .json({ error: "An error occurred during website verification" });
  }
}
