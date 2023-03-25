interface apiConfig {
  BOT_TOKEN: string;
  Prefix: string;
  Servers: string[];
}

import Discord = require("discord.js");
import DiscordVoice = require("@discordjs/voice");
import ytdl = require("ytdl-core");
import ytpl = require("ytpl");
import crypto = require("crypto");
import yt = require("youtube-search-without-api-key");
const redditApiImageGetter = require("reddit-api-image-getter");
const getter = new redditApiImageGetter();
import AudioPlayer from "./AudioPlayer";
import {PythonShell} from 'python-shell';
import fs = require('fs');
import path = require('path');
const baseDir = path.dirname(__dirname);

let servers = {};

const config: apiConfig = require("../config/api.json");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_MEMBERS"],
});

function createAudioPlayer(param: string, message: Discord.Message) {
  //@ts-ignore
  if (servers[message.guildId]) {
    //@ts-ignore
    servers[message.guildId].queue(param);
  } else {
    const connection = DiscordVoice.joinVoiceChannel({
      //@ts-ignore
      channelId: message.member.voice.channelId || "",
      guildId: message.guildId || "",
      //@ts-ignore
      adapterCreator: message.guild?.voiceAdapterCreator,
    });
    let audio = new AudioPlayer(
      //@ts-ignore
      message.guild,
      message.channel,
      param,
      connection
    );
    //@ts-ignore
    servers[message.guildId] = audio;
    audio.onDisconnect((guildId) => {
      //@ts-ignore
      delete servers[guildId];
    });
  }
}

const Play = async (message: Discord.Message) => {
  if (message.member && message.guild) {
    const param = message.content.slice(config.Prefix.length).split(" ")[1];
    let playlist: Array<string> = [];
    let playlistItems;
    try {
      playlistItems = await ytpl(param);
      playlistItems.items.forEach((item) => {
        playlist.push(item.url);
      });
    } catch {}
    if (playlist.length == 0) {
      if (ytdl.validateURL(param)) {
        createAudioPlayer(param, message);
      } else {
        yt.search(message.content.replace(config.Prefix + "play ", ""))
          .then((video) => {
            createAudioPlayer(video[0].url, message);
          })
          .catch(() => {
            message.channel.send("Unable to find video.");
          });
      }
    } else {
      playlist.forEach((url) => {
        createAudioPlayer(url, message);
      });
    }
  } else {
    message.channel.send("Please join a call.");
  }
};

const Skip = (message: Discord.Message) => {
  try {
    //@ts-ignore
    servers[message.guildId].skip();
  } catch {
    message.channel.send("Bot not in active call.");
  }
};

const Pause = (message: Discord.Message) => {
  try {
    //@ts-ignore
    servers[message.guildId].pause();
  } catch {
    message.channel.send("Bot not in active call.");
  }
};

const Resume = (message: Discord.Message) => {
  try {
    //@ts-ignore
    servers[message.guildId].resume();
  } catch {
    message.channel.send("Bot not in active call.");
  }
};

const Leave = (message: Discord.Message) => {
  try {
    //@ts-ignore
    servers[message.guildId].leave();
  } catch {
    message.channel.send("Bot not in active call.");
  }
};

const Avatar = (message: Discord.Message) => {
  let url: string | Discord.MessageEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Invalid Selection")
    .setDescription(
      "Please use the Avatar command with a valid parameter (powered by dicebear)"
    )
    .addFields(
      { name: "bottts", value: "A robot avatar", inline: true },
      { name: "adventurer", value: "An adventurer avatar", inline: true },
      { name: "avataaars", value: "Just an avatar", inline: true },
      { name: "big-ears", value: "An avatar with big ears", inline: true },
      { name: "big-smile", value: "An avatar with a big smile", inline: true },
      { name: "croodles", value: "Like doodles but cool", inline: true },
      { name: "identicon", value: "Symbols?", inline: true },
      { name: "micah", value: "Just an avatar (art style)", inline: true },
      { name: "miniavs", value: "Just an avatar (art style)", inline: true },
      { name: "open-peeps", value: "Just an avatar (art style)", inline: true },
      { name: "personas", value: "Just an avatar (art style)", inline: true },
      { name: "pixel-art", value: "Pixel art avatar", inline: true }
    )
    .setTimestamp();
  const param = message.content.slice(config.Prefix.length).split(" ")[1];
  switch (param) {
    case "bottts":
      url = `https://avatars.dicebear.com/api/bottts/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "adventurer":
      url = `https://avatars.dicebear.com/api/adventurer/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "avataaars":
      url = `https://avatars.dicebear.com/api/avataaars/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "big-ears":
      url = `https://avatars.dicebear.com/api/big-ears/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "big-smile":
      url = `https://avatars.dicebear.com/api/big-smile/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "croodles":
      url = `https://avatars.dicebear.com/api/croodles/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "identicon":
      url = `https://avatars.dicebear.com/api/identicon/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "micah":
      url = `https://avatars.dicebear.com/api/micah/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "miniavs":
      url = `https://avatars.dicebear.com/api/miniavs/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "open-peeps":
      url = `https://avatars.dicebear.com/api/open-peeps/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "personas":
      url = `https://avatars.dicebear.com/api/personas/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
    case "pixel-art":
      url = `https://avatars.dicebear.com/api/pixel-art/${crypto
        .createHash("sha256")
        .update(message.author.username + message.createdTimestamp)
        .digest("hex")}.png`;
      break;
  }
  if (typeof url == "string") {
    message.channel.send(url);
  } else {
    message.channel.send({ embeds: [url] });
  }
};

const Coin = (message: Discord.Message) => {
  const x = Math.floor(Math.random() * 2) == 0;
  if (x) {
    message.reply("Heads");
  } else {
    message.reply("Tails");
  }
};

const EightBall = (message: Discord.Message) => {
  const listofanswers = [
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "Yes, definitely.",
    "You may rely on it.",
    "As I see it, yes.",
    "Most likely.",
    "Outlook good.",
    "Yes.",
    "Signs point to yes.",
    "Reply hazy, try again.",
    "Ask again later.",
    "Better not tell you now.",
    "Cannot predict now.",
    "Concentrate and ask again.",
    "Don't count on it.",
    "My reply is no.",
    "My sources say no.",
    "Outlook not so good.",
    "Very doubtful.",
  ];
  const x = Math.random();
  const randomAnswer = Math.floor(x * listofanswers.length);
  const answer = listofanswers[randomAnswer];
  message.reply(answer);
};

const Meme = (message: Discord.Message) => {
  const subReddits = ["ProgrammerHumor", "dankmemes"];

  const x = Math.random();
  const selectedSubReddit = subReddits[Math.floor(x * subReddits.length)];

  getter
    .getHotImagesOfSubReddit(selectedSubReddit)
    .then((result: Array<object>) => {
      const y = Math.random();

      //@ts-ignore
      const selectedMeme = result[Math.floor(y * result.length)].url;
      message.channel.send(selectedMeme);
    })
    .catch((error: any) => {
      console.log(error);
    });
};

const Help = (message: Discord.Message) => {
  let embedList = [];
  for (const property in commands) {
    //@ts-ignore
    embedList.push({
      name: config.Prefix + property,
      //@ts-ignore
      value: commands[property]["message"],
    });
  }
  let helpMessage: Discord.MessageEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .addFields(embedList)
    .setTimestamp();
  message.reply({ embeds: [helpMessage] });
};

const reportHypeDC = async(message: Discord.Message) => {
  if (message.member && message.guild) {
    const param = message.content.slice(config.Prefix.length).split(" ")[1];
    if (param.includes("hypedc.com")) {
      const timestamp = (new Date().getTime()).toString();
      let options = {
        mode: 'text',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: path.join(baseDir, "scripts"),
        args: [param, timestamp]
      };
      console.log(path.join(baseDir, "scripts"));
      //@ts-ignore
      PythonShell.run("reportHypeDC.py", options, async function (err, results) {
        if (err) {
          console.log(err);
        }
        if (results) {
          const quantity = results[0];
          console.log(quantity);
          await message.reply("Total Stock: " + quantity);
          const stockDir = path.join(baseDir, "dist", timestamp , "Stock.xlsx")
          await message.channel.send({files: [stockDir]});
          fs.rmSync(path.join(baseDir, "dist", timestamp), { recursive: true, force: true });
        }
      });
    }
    else {
      message.reply("Please Provide a Valid URL.");
    }
  }
}

const commands = {
  play: {
    command: Play,
    message: "Plays or queues a video or playlist from Youtube.",
  },
  skip: { command: Skip, message: "Skips the current playing video." },
  pause: { command: Pause, message: "Pauses the current playing video." },
  resume: { command: Resume, message: "Resumes the current playing video." },
  leave: {
    command: Leave,
    message: "Makes the bot leave the current vc and clears queue.",
  },
  avatar: {
    command: Avatar,
    message: "Generates a random avatar using the specified method.",
  },
  coin: { command: Coin, message: "Flips an fair coin." },
  "8ball": { command: EightBall, message: "Ask the magic 8 ball a question." },
  meme: { command: Meme, message: "Gets a random meme from Reddit." },
  reporthypedc: {command: reportHypeDC, message: "Supply a Hype DC URL to get a breakdown of stock information."},
  help: { command: Help, message: "Shows the help menu." },
};

client.on("messageCreate", function (message) {
  if (message.author.bot) {
    return;
  }
  if (!message.guildId) {
    return;
  }

  if (!(message.content[0] === config.Prefix)) {
    return;
  }

  if (!config.Servers.includes(message.guildId)) {
    message.channel.send("This Server is Not Authorised.")
    return;
  }

  const command = message.content
    .slice(config.Prefix.length)
    .split(" ")[0]
    .toLowerCase();
  if (new Set(Object.keys(commands)).has(command)) {
    try {
      //@ts-ignore
      commands[command]["command"](message);
    } catch {}
  } else {
    message.channel.send("Command Not Found.");
  }
});

client
  .login(config.BOT_TOKEN)
  .then(() => {
    console.log("Bot Successfully Logged In.");
    client.user?.setActivity(config.Prefix + "help for commands");
  })
  .catch((er) => {
    console.log("Bot Failed to Login.");
    console.log(er);
  });
