import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cron from "node-cron";

dotenv.config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT || 3000);
const botToken = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;
const monthlyCron = process.env.MONTHLY_CRON || "0 9 1 * *";
const timezone = process.env.TIMEZONE || "Africa/Addis_Ababa";

function validateConfig(): void {
  const missingVars: string[] = [];

  if (!botToken) {
    missingVars.push("BOT_TOKEN");
  }

  if (!channelId) {
    missingVars.push("CHANNEL_ID");
  }

  if (missingVars.length > 0) {
    throw new Error(`Missing required env vars: ${missingVars.join(", ")}`);
  }

  if (!cron.validate(monthlyCron)) {
    throw new Error(`Invalid MONTHLY_CRON expression: ${monthlyCron}`);
  }
}

async function sendTelegramMessage(): Promise<void> {
  if (!botToken || !channelId) {
    throw new Error("Missing BOT_TOKEN or CHANNEL_ID");
  }

  const text = `btw i'm a man!`;
  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: channelId,
      text
    })
  });

  const result = (await response.json()) as {
    ok: boolean;
    description?: string;
  };

  if (!response.ok || !result.ok) {
    const reason = result.description || `HTTP ${response.status}`;
    throw new Error(`Telegram send failed: ${reason}`);
  }
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    schedule: monthlyCron,
    timezone
  });
});

app.post("/send-message", async (_req: Request, res: Response) => {
  try {
    await sendTelegramMessage();
    res.status(200).json({ success: true, message: "Message sent" });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: details });
  }
});

try {
  validateConfig();

  cron.schedule(
    monthlyCron,
    async () => {
      try {
        await sendTelegramMessage();
        console.log(`[cron] Message sent at ${new Date().toISOString()}`);
      } catch (error) {
        const details = error instanceof Error ? error.message : "Unknown error";
        console.error(`[cron] Send failed: ${details}`);
      }
    },
    { timezone }
  );

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Monthly schedule: '${monthlyCron}' (${timezone})`);
  });
} catch (error) {
  const details = error instanceof Error ? error.message : "Unknown startup error";
  console.error(`Startup failed: ${details}`);
  process.exit(1);
}
