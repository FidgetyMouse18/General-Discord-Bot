import Opus = require("@discordjs/opus");
import ytdl = require("ytdl-core");
import Discord = require("discord.js");
import DiscordVoice = require("@discordjs/voice");

type textChannel =
  | Discord.DMChannel
  | Discord.PartialDMChannel
  | Discord.NewsChannel
  | Discord.TextChannel
  | Discord.ThreadChannel;

export default class AudioPlayer {
  _guild: Discord.Guild;
  _queue: Array<string>;
  _player: DiscordVoice.AudioPlayer;
  _subscription: DiscordVoice.PlayerSubscription | undefined;
  _textChannel: textChannel;
  _connection: DiscordVoice.VoiceConnection;
  paused: boolean;
  private handlers: Array<(guildID: string) => void> = [];

  constructor(
    guild: Discord.Guild,
    textChannel: textChannel,
    firstUrl: string,
    connection: DiscordVoice.VoiceConnection,
  ) {
    this._guild = guild;
    this._queue = [firstUrl];
    this._textChannel = textChannel;
    this._connection = connection;
    this.paused = false;

    this._player = DiscordVoice.createAudioPlayer({
      behaviors: {
        noSubscriber: DiscordVoice.NoSubscriberBehavior.Play,
      },
    });
    this._subscription = connection.subscribe(this._player);
    this.play();
    this._player.on(DiscordVoice.AudioPlayerStatus.Idle, () => {
      this._queue.shift();
      if (this._queue.length > 0) {
        this.play();
      } else {
        this.leave();
      }
    });
  }

  sec2time(timeInSeconds: string) {
    var pad = function (num: number, size: number) {
        return ("000" + num).slice(size * -1);
      },
      time: number = parseFloat(timeInSeconds),
      hours = Math.floor(time / 60 / 60),
      minutes = Math.floor(time / 60) % 60,
      seconds = Math.floor(time - minutes * 60);

    return pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
  }

  public onDisconnect(handler: (guildID: string) => void): void {
    this.handlers.push(handler);
  }

  public trigger(guildID: string): void {
    // Duplicate the array to avoid side effects during iteration.
    this.handlers.slice(0).forEach((h) => h(guildID));
  }

  queue(url: string) {
      ytdl.getInfo(url).then((data) => {
        this._textChannel.send("Added to Queue: " + data.videoDetails.title);
        this._queue.push(url);
      });
  }

  skip() {
    this._player.stop(true);
  }

  pause() {
    this.paused = true;
    this._player.pause(true);
    this._textChannel.send("Player Paused.");
  }

  resume() {
    this.paused = false;
    this._player.unpause();
    this._textChannel.send("Player Resumed.");
  }

  leave() {
    try {
      this._queue = [];
      if (this._connection) {
        if (this._subscription) {
          this._subscription.unsubscribe();
        }
        this._connection.destroy();
        this.trigger(this._guild.id);
      }
    } catch {}
  }

  play() {
    if (ytdl.validateURL(this._queue[0])) {
      try {
        var stream = ytdl(this._queue[0], {
          filter: "audioonly",
          highWaterMark: 1 << 25,
        });

        ytdl.getInfo(this._queue[0]).then((data) => {
          let currentPlaying: Discord.MessageEmbed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setTitle(data.videoDetails.title)
            .setURL(data.videoDetails.video_url)
            .addFields(
              {
                name: "Duration",
                value: this.sec2time(data.videoDetails.lengthSeconds),
                inline: true,
              },
              {
                name: "Video By",
                value: data.videoDetails.author.name,
                inline: true,
              }
            )
            .setThumbnail(data.videoDetails.thumbnails[0].url)
            .setTimestamp();
          this._textChannel.send({ embeds: [currentPlaying] });
          const resource = DiscordVoice.createAudioResource(stream);
          this._player.play(resource);
          this._connection.subscribe(this._player);
        });
      } catch {
        this._textChannel.send("Please Enter a valid Youtube Video.");
      }
    }
    else {
      this._textChannel.send("Please Enter a valid Youtube Video.");
    }
  }
}
