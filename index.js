const unirest = require('unirest');
const fs = require('fs');
const Discord = require('discord.js');
var instaHandleService = require('./instaHandleClass');

const client = new Discord.Client();

const discordBotToken= process.env.discordBotToken;

var accessTokenLongForRefreshing = process.env.initialInstaLongAccessToken;;

var accessTokenLong= accessTokenLongForRefreshing.split(' ');
var services=[];

client.login(discordBotToken);


client.on('ready',()=>{
	console.log('This bot is online');
	var i;
	for(i=0;i<accessTokenLong.length;i++){
		services.push(new instaHandleService(client,accessTokenLong[i]));
		services[i].startService();//ater bot is online start polling
	}
})

client.on('message',msg=>{
	console.log('New request');
	if(msg.content==='hi'){
			msg.reply("hello");
	}
})
