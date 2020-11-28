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

client.on('message',msg=>{
	console.log('New request');

	var msg = msg.content.toLowerCase();

  const PREFIX = '';
	let args = msg.content.substring(PREFIX.length).split(" ");

	if(msg.content==='hi'){
			msg.reply("hello");
	}
	if(args[0] == 'ein'){
		console.log('New message request');
		console.log(msg.content.substr(msg.content.indexOf(' ')+1));
		client.channels.cache.get('782310277956763658').send(msg.content.substr(msg.content.indexOf(' ')+1));
	}
})
