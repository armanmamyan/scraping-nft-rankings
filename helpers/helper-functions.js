const isUsingStealthPlugin = (browserInstance) => {
  return (browserInstance._process?.spawnargs || []).includes(
    "--disable-blink-features=AutomationControlled"
  );
};
// @ts-ignore
const warnIfNotUsingStealth = (browserInstance) => {
  if (!browserInstance) {
    throw new Error("No or invalid browser instance provided.");
  }
  if (!isUsingStealthPlugin(browserInstance)) {
    console.warn(
      "🚧 WARNING: You are using puppeteer without the stealth plugin. You most likely need to use stealth plugin to scrape Opensea."
    );
  }
};

// export functions
module.exports = { warnIfNotUsingStealth, isUsingStealthPlugin };
