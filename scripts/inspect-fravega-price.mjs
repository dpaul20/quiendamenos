import axios from "axios";
import { load } from "cheerio";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "es-AR,es;q=0.9",
};

const { data } = await axios.get("https://www.fravega.com/l/?keyword=samsung", {
  headers: { ...HEADERS, Referer: "https://www.fravega.com/" },
  maxRedirects: 5,
});
const $ = load(data);

// Print price HTML for first 3 articles
$("article").slice(0, 3).each((i, article) => {
  const el = $(article);
  const name = el.find("[data-test-id='article-title'] span").first().text().trim();
  const url = el.find("a[rel='bookmark'][href^='/p/']").first().attr("href");
  const priceHtml = el.find("[data-test-id='product-price']").html()?.slice(0, 800);
  const priceText = el.find("[data-test-id='product-price']").text().replace(/\s+/g, " ").trim();
  const img = el.find("img[src*='images.fravega.com/f300/']").attr("src");
  console.log(`\n--- Article ${i} ---`);
  console.log("name:", name);
  console.log("url:", url);
  console.log("img:", img?.slice(0, 80));
  console.log("priceText:", priceText);
  console.log("priceHtml:", priceHtml);
});
