require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const cron = require("node-cron");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const CHANNEL_ID = process.env.CHANNEL_ID;
const ROLE_ID = "1487167480043540560";

const START_ID = 1413
const START_DATE = new Date("2026-03-27"); //hardcode no restart

function getTodayId() {
  // Current date in New York
  const currentDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  // Start date in New York
  const startDate = new Date(
    START_DATE.toLocaleString("en-US", { timeZone: "America/New_York" })
  );

  // Normalize both to midnightg
  currentDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);

  // Difference in days
  const diffDays = Math.floor(
    (currentDate - startDate) / (1000 * 60 * 60 * 24)
  );

  return START_ID + diffDays - 1;
}

async function sendDailyMessage() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  const id = getTodayId();

  const message = `<@&${ROLE_ID}> \n# GuessTheGame #${id}\n\nhttps://guessthe.game/p/${id}`;

  await channel.send(message);
  console.log("Sent:", message);
}

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);

  sendDailyMessage();

  cron.schedule("0 9 * * *", () => {
    sendDailyMessage();
  });
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('Basketball is paul's favorite sport!');
  }
});

client.login(process.env.TOKEN);