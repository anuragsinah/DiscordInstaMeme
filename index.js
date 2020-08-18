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
	if(msg.content==='hi'){
			msg.reply("hello");
	}
})
