# Telegram Monthly Sender (TypeScript)

Node + Express backend that sends a Telegram channel message once each month.

## Message

The service sends:

`btw i'm a male - <ISO timestamp>`

## Schedule

Default monthly schedule:

- Cron: `0 9 1 * *`
- Timezone: `Africa/Addis_Ababa`

This means the message is sent on the 1st day of each month at 09:00.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your env file from example:

```bash
cp .env.example .env
```

3. Fill in `.env` values:

- `BOT_TOKEN` (Telegram bot token)
- `CHANNEL_ID` (e.g. `@your_channel` or `-100...`)

## Run

Development mode:

```bash
npm run dev
```

Build + run production:

```bash
npm run build
npm run start
```

## Endpoints

- `GET /health` - basic status, cron, timezone
- `POST /send-message` - manual trigger for testing

Manual test example:

```bash
curl -X POST http://localhost:3000/send-message
```

## Important Telegram requirement

Your bot must be added to your channel as an admin with permission to post messages.
