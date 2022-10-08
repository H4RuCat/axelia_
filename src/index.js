 require('dotenv').config();

const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, SlashCommandBuilder, ApplicationCommandDataResolvable } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, entersState, createAudioResource, StreamType, AudioPlayerStatus, VoiceConnectionStatus, NoSubscriberBehavior } = require('@discordjs/voice')

const voice = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yts = require( 'yt-search' )
const { StreamDispatcher } = require('discord-player');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

var queue = [];

client.once('ready', async () => {
	console.log('起動完了');

  const data = [
    { name: "stop", description: "再生中の音楽を停止します。"},
    { name: "repeat", description: "再生中の音楽を繰り返します。"},
    { name: "nowplaying", description: "再生中の音楽の情報を表示します。"},
    { name: "lyric", description: "再生中の音楽の歌詞を表示します。"},
    { name: "pause", description: "再生中の音楽を停止します"},
    { name: "play",
      description: "指定された音楽を再生します。",
      options: [{
          type: "STRING",
          name: "link-or-title",
          description: "URLか音楽のタイトルを指定してください。",
          required: true,
      }],
  }
  ]

    await client.application.commands.set(data, '624184514922676224');
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
      return;
  }
  if (interaction.commandName === 'play') {
      
      const channel = interaction.member.voice.channel;

      if(!channel) return await interaction.reply('ボイスチャンネルに接続してください。');

      if(channel) {

         const url = interaction.options.getString('link-or-title')

         if (!ytdl.validateURL(url)) {

          yts( url, function ( err, r ){

            const videos = r.videos

            const searchEmbed = new MessageEmbed()
            .setColor('#f5c1cc')
            .setTitle('検索結果')
            .setDescription('ボタンでトラックを指定')
            .addFields(
            { name: '** **', value: '1: **' + videos[0].title + '**'}, 
            { name: '** **', value: '2: **' + videos[1].title + '**'}, 
            { name: '** **', value: '3: **' + videos[2].title + '**'}, 
            { name: '** **', value: '4: **' + videos[3].title + '**'},
            { name: '** **', value: '5: **' + videos[4].title + '**'}
            )

             interaction.reply({ embeds: [ searchEmbed ] });

          })

      } else if(ytdl.validateURL(url)) {

        queue.push([ interaction.guildId, url ])
        console.log(queue)

        interaction.reply({
          content: url + ' いれました'
        })

      } else {
        interaction.reply({
          content: "URLが見つかりません。"
        })

      }

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfMute: false,
        selfDeaf: true,
       });

       const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Pause,
        },
      });
      
      const subscription = connection.subscribe(player);

      subscription;

      if (ytdl.validateURL(queue[0])) {

        const stream = ytdl(ytdl.getURLVideoID(queue[0]), {

          filter: format => format.audioCodec === 'opus' && format.container === 'webm',
          quality: 'highest',
          highWaterMark: 32 * 1024 * 1024
        });

        const resource = createAudioResource(stream, {
          inputType: StreamType.WebmOpus
        });

        player.play(resource);

        
  }
}
}});

client.on('messageCreate', async (message) => {

});

const token = process.env.TOKEN;

if (!token) {
  throw new Error("Tokenが指定されてません。");
}

client.login(token);