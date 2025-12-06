import cron from "cron";
import https from "https";

async function pingBackend(retries = 3, delay = 2000) {
  return new Promise((resolve) => {
    https
      .get(`${process.env.BACKEND_URL}/cron`, (res) => {
        if (res.statusCode === 200) {
          console.log("Cron request successful:", res.statusCode);
          return resolve(true);
        }

        console.log("Cron request failed:", res.statusCode);
        if (retries > 0) {
          console.log(`Retrying... (${3 - retries + 1})`);
          setTimeout(() => {
            resolve(pingBackend(retries - 1, delay));
          }, delay);
        } else {
          resolve(false);
        }
      })
      .on("error", (e) => {
        console.error("Error in Cron job:", e);
        if (retries > 0) {
          console.log(`Retrying... (${3 - retries + 1})`);
          setTimeout(() => {
            resolve(pingBackend(retries - 1, delay));
          }, delay);
        } else {
          resolve(false);
        }
      });
  });
}

const job = new cron.CronJob("*/14 * * * *", async function () {
  await pingBackend();
});

export { job as cronJob };
