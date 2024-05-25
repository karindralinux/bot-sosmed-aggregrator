import type { Page } from "@playwright/test";

export const listenNetworkRequests = async (page: Page) => {
  // Listen to network requests
  await page.route("**/*", (route) => {
    const url = route.request().url();
    // block pictures and videos
    if (url.includes("video")) {
      return route.abort();
    }

    route.continue();
  });
};