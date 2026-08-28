/**
 * LHCI requires a puppeteerScript to activate its managed browser. The
 * Lighthouse runs connect to that browser by its debugger port; no page
 * mutation or network access is needed here.
 */
module.exports = async function lighthousePuppeteerBootstrap() {};
