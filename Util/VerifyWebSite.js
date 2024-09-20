import axios from "axios";
import https from "https";
import { load } from "cheerio";
import { parse } from "url";

async function fetchContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
}

async function detectCaptcha(
  url,
  maxAttempts = 3,
  delayBetweenAttempts = 2000
) {
  const checkForCaptcha = async () => {
    try {
      const html = await fetchContent(url);
      if (!html)
        return {
          detected: false,
          type: null,
          error: "Failed to fetch the website",
        };

      const $ = load(html);
      let allContent = html;

      const scriptPromises = $("script[src]")
        .map(async (i, el) => {
          const scriptSrc = $(el).attr("src");
          const fullUrl = new URL(scriptSrc, url).href;
          const scriptContent = await fetchContent(fullUrl);
          return scriptContent;
        })
        .get();

      const scripts = await Promise.all(scriptPromises);
      allContent += scripts.join("\n");

      const captchaTypes = [
        { name: "reCAPTCHA", regex: /grecaptcha|google\.com\/recaptcha/i },
        { name: "hCaptcha", regex: /hcaptcha\.com|\.hcaptcha\./i },
        {
          name: "Cloudflare Turnstile",
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
        error: `Failed to analyze the website: ${error.message}`,
      };
    }
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await checkForCaptcha();
    if (result.detected) {
      return result;
    }
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenAttempts));
    }
  }

  return { detected: false, type: null };
}

function checkSSL(url) {
  return new Promise((resolve) => {
    if (!url.startsWith("http")) {
      resolve({ isValid: false, message: "URL must start with http or https" });
      return;
    }

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
}

async function checkPrice(url, price) {
  if (price === undefined || price === null) {
    return { isValid: false, message: "Price is not provided" };
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const $ = load(response.data);

    const normalizedPrice = price.toString().replace(/[^\d.,]/g, "");
    const priceRegex = new RegExp(`\\b${normalizedPrice}\\b`, "i");

    const priceElements = $("body *").filter(function () {
      const text = $(this).text().trim();
      return priceRegex.test(text);
    });

    if (priceElements.length === 0) {
      return { isValid: false, message: "Price not found on the page" };
    }

    const isHighlighted = priceElements.toArray().some((element) => {
      const $el = $(element);
      const styles = getComputedStyle($el[0]);
      const parentStyles = getComputedStyle($el.parent()[0]);

      return (
        styles.fontWeight >= 600 ||
        parseFloat(styles.fontSize) > parseFloat(parentStyles.fontSize) ||
        styles.color !== parentStyles.color ||
        styles.backgroundColor !== parentStyles.backgroundColor ||
        $el.find("strong, b, em, i").length > 0
      );
    });

    if (isHighlighted) {
      return {
        isValid: true,
        message: "Price found and highlighted on the page",
      };
    } else {
      return {
        isValid: false,
        message: "Price found but not highlighted on the page",
      };
    }
  } catch (error) {
    console.error("Error checking price:", error.message);
    return {
      isValid: false,
      message: `Failed to check price: ${error.message}`,
    };
  }
}

function getComputedStyle(element) {
  return {
    fontWeight:
      element.attribs.style?.match(/font-weight:\s*(\d+)/)?.[1] || "400",
    fontSize: element.attribs.style?.match(/font-size:\s*(\d+)/)?.[1] || "16",
    color: element.attribs.style?.match(/color:\s*([^;]+)/)?.[1] || "inherit",
    backgroundColor:
      element.attribs.style?.match(/background-color:\s*([^;]+)/)?.[1] ||
      "transparent",
  };
}

export async function verifyWebsite(req, res) {
  const { url, price } = req.body;
  console.log("Received request:", { url, price });

  const captcha = await detectCaptcha(url);
  const isSSL = await checkSSL(url);

  let fontIsClear;
  if (price !== undefined && price !== null && price !== "") {
    fontIsClear = await checkPrice(url, price);
  } else {
    fontIsClear = {
      isValid: false,
      message: "Price not provided in the request",
    };
  }

  res.json({ captcha, isSSL, fontIsClear });
}
