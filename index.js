'use strict';
const unirest = require('unirest');
const fs = require('fs');
const Discord = require('discord.js');
var fireStoreService = require('./fireStore');
var newUserWeb = require('./newUserWeb');
const client = new Discord.Client();

const discordBotToken= process.env.discordBotToken;

var services=[];

client.login(discordBotToken);


client.on('ready',()=>{
	console.log('This bot is online');
	fireStoreService.startSnapshortUser(client);
})

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

client.on('message',msg=>{
	console.log('New request');
  if(msg.author.bot){return;}

  console.log(msg);
  const PREFIX = '';
	let args = msg.content.substring(PREFIX.length).split(" ");

	if(msg.content==='hi'){
			msg.reply("hello");
	}
	args[0] = args[0].toLowerCase();
	if(args[0] == 'ein' && args.length>0){
		var randomInt = getRandomInt(15);
		console.log('New message request');
		console.log("randomInt "+ randomInt);
		if(msg.content.indexOf(' ') != -1){
		  client.channels.cache.get('782310277956763658').send(msg.content.substr(msg.content.indexOf(' ')+1));
			if(msg.author.id != '737751178233774190' && msg.author.id != '692326717804773416'){
				if(randomInt == 8){
					client.channels.cache.get('782310277956763658').send("<@!"+msg.author.id+"> is that you..????");
				}
			}
  	}
	}
})
