import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(`${process.env.BACKEND_URL}/cron`, (res) => {
      if (res.statusCode === 200)
        console.log("Cron request successful:", res.statusCode);
      else console.log("Cron request failed:", res.statusCode);
    })
    .on("error", (e) => console.error("Error in Cron job:", e));
});

export { job as cronJob };
