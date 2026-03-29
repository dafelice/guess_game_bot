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


const { execSync } = require("child_process");

function getLatestCommitInfo() {
  try {
    const commitInf = execSync(
      "git log -1 --pretty=format:%h\\|%s\\|%an\\|%cI"
    ).toString().trim();

    console.log("GIT OUTPUT:", commitInf);

    const [hash, gitMessage, author, isoDate] = commitInf.split("|");

    return { hash, gitMessage, author, isoDate };
  } catch (err) {
    console.error("Failed to get commit message:", err);
    return null;
  }
}


function formatToNYTime(isoDate) {
  return new Date(isoDate).toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function sendStartupMessage() {
  const channel = await client.channels.fetch(CHANNEL_ID);
  const commit = getLatestCommitInfo();
  let message = "Bot started up succesfully!";

  if (commit) {
    const nyTime = formatToNYTime(commit.isoDate);
    message += `\n ${commit.gitMessage}`;
    message += `\n ${nyTime} (ET)`;
  }

  await channel.send(message);
}

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);

  sendStartupMessage();

  cron.schedule("0 10 * * *", () => {
    sendDailyMessage();
  },{
    timezone: "America/New_York",
  });
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('Basketball is pauls favorite sport!');
  }
});

client.login(process.env.TOKEN);