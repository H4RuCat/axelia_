 require('dotenv').config();

const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, SlashCommandBuilder, ApplicationCommandDataResolvable } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, entersState, createAudioResource, StreamType, AudioPlayerStatus, VoiceConnectionStatus, NoSubscriberBehavior } = require('@discordjs/voice')

const voice = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yts = require( 'yt-search' )
const { StreamDispatcher } = require('discord-player');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

var queue = [];

let queueCheck1 = 0
let queueCheck2 = 1

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});

while(!queue > 0) {
  entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1); {

    const stream = ytdl(ytdl.getURLVideoID(queue[queueCheck2]), {
    
      filter: format => format.audioCodec === 'opus' && format.container === 'webm',
      quality: 'highest',
      highWaterMark: 32 * 1024 * 1024
    });
    
    const resource = createAudioResource(stream, {
      inputType: StreamType.WebmOpus
    });
  
    if(repeatSwitch == 1 && queue.length > 0) {
      
        player.play(resource)
    } 
    if(repeatSwitch == 2 && queue.length > 0) {
    
        queue.shift()
    
        console.log(queue)
        player.play(resource)
  }
  }
}

client.once('ready', async () => {
	console.log('起動完了');

  const data = [
    { name: "nowplaying", description: "再生中の音楽の情報を表示します。"},
    { name: "lyric", description: "再生中の音楽の歌詞を表示します。"},
    { name: "pause", description: "再生中の音楽を停止します"},
    { name: "stop",
      description: "再生中の音楽を停止します。",
    },
    { name: "play",
      description: "指定された音楽を再生します。",
      options: [{
          type: "STRING",
          name: "link-or-title",
          description: "URLか音楽のタイトルを指定してください。",
          required: true,
      }],
    },
    { name: "repeat",
      description: "再生中の音楽を繰り返します。",
      options: [{
          type: "STRING",
          name: "option",
          description: "repeatのタイプを指定してください",
          required: true,
          choices: [
            {
              name: "single",
              value: "single"
            },
            {
              name: "all",
              value: "all"
            },
            {
              name: "off",
              value: "off"
            }
          ],
      }],
    }
  ]

    await client.application.commands.set(data, '624184514922676224');
    await client.application.commands.set(data, '974108990751506432');
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

        queue.push( interaction.guildId, url )
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

      
      const subscription = connection.subscribe(player);

      subscription;

      for (queueCheck1 = 0, queueCheck2 = 1 ; ytdl.validateURL(queue[queueCheck2]) && interaction.guildId == queue[queueCheck1]; queueCheck1 + 2 , queueCheck2 + 2) {

        console.log(queueCheck1 + ' | ' + queueCheck2)

        const stream = ytdl(ytdl.getURLVideoID(queue[queueCheck2]), {

          filter: format => format.audioCodec === 'opus' && format.container === 'webm',
          quality: 'highest',
          highWaterMark: 32 * 1024 * 1024
        });
        
        const resource = createAudioResource(stream, {
          inputType: StreamType.WebmOpus
        });

        player.play(resource);
        
        return;
        }
      }
  } 
  if (interaction.commandName === 'repeat') {

    const repeatOption = interaction.options.getString('option')

    if(repeatOption == 'single') {
      
      repeatSwitch = 1
      interaction.reply('再生中の音楽を繰り返します')

    }
    if (repeatOption == 'off') {

      repeatSwitch = 2
      interaction.reply('音楽の繰り返しをOFFにしました')

    }
    if (repeatOption == 'all') {

      repeatSwitch = 3
      interaction.reply('キューの音楽を繰り返します')

    }
  }
  if (interaction.commandName === 'stop') {

    voice.getVoiceConnection(message.channel.guild.id).disconnect();

    interaction.reply('ボイスチャットから切断しました')

  }
});

client.on('messageCreate', async (message) => {

});

const token = process.env.TOKEN;

if (!token) {
  throw new Error("Tokenが指定されてません。");
}

client.login(token);