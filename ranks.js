const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const puppeteer = require("puppeteer-extra");
const log = require("../helpers/logger");

const { warnIfNotUsingStealth } = require("../helpers/helper-functions");
const {
  OPENSEA_RANKINGS_PAGE,
  OPENSEA_RESPONSE_URL,
} = require("../constants/app");

const logger = log.getLogger();

puppeteer.use(StealthPlugin());

const NEXT_PAGE_SELECTOR = "i[value='arrow_forward_ios']";
const PAGE_LOAD_DELAY = 15 * 1000; // 15 sec;

async function ranking() {
  let type;
  const chain = "solana";

  const handlePageLoad = async (request) => {
    const response = await request.response();

    if (
      response?.url() === OPENSEA_RESPONSE_URL &&
      request.method() === "POST"
    ) {
      logger.info("Found response on Rankings page, start parsing...");
      const { data } = await response.json();
      if (data?.rankings?.edges) {
        const collectionData = data.rankings.edges;

        // eslint-disable-next-line no-restricted-syntax
        for (const element of collectionData) {
          // workerpool.workerEmit({ data: element.node, type });
          console.log({ data: element.node, type });
        }
      }
    }
  };

  const run = async (collectionType) => {
    type = collectionType;
    try {
      logger.info("Ranking Job Started started");

      const browser = await puppeteer.launch({
        headless: false,
        args: ["--start-maximized"],
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      warnIfNotUsingStealth(browser);

      const page = await browser.newPage();
      const url = `${OPENSEA_RANKINGS_PAGE}?category=${collectionType}&sortBy=seven_day_volume&chain=${chain}`;

      await page.goto(url);

      await page.waitForSelector(".cf-browser-verification", { hidden: true });
      page.on("requestfinished", handlePageLoad);

      const className = await page.$(NEXT_PAGE_SELECTOR);
      if (!className) {
        logger.error("Next Page selector not found");
        return;
      }

      let handler = (await className.$x(".."))[0];
      let isDisabled = await (
        await handler.getProperty("disabled")
      ).jsonValue();

      let children = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        return document.querySelector("div[role=\"list\"]").childElementCount;
      });
      while (handler && children > 0) {
        await handler.click();

        logger.info("Go to next page");
        await page.waitForTimeout(PAGE_LOAD_DELAY);
        // eslint-disable-next-line prefer-destructuring
        handler = (await className.$x(".."))[0];
        isDisabled = await (await handler.getProperty("disabled")).jsonValue();
        children = await page.evaluate(() => {
          // eslint-disable-next-line no-undef
          return document.querySelector("div[role=\"list\"]").childElementCount;
        });
      }
      logger.info("Rankings Job successfully finished");

      process.exit(0);
    } catch (err) {
      console.log("err", err);
      logger.error("Rankings Job was failed, updating job status");
      throw err;
    }
  };

  return {
    run,
  };
}

// workerpool.worker({
//   call,
// });

async function call({ category }) {
  await (await ranking()).run(category);
}

module.exports = { call };
