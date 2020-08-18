'use strict';

const admin=require('firebase-admin');
const express = require('express') ;
var http = require('http');
var exp = new express() ;
var unirest = require('unirest');
var PORT = process.env.PORT || 5000;
var keepAliveTimeId;
exp.get('/', async (req, res)=>{
    try{
          console.log("Query for the new user. With query as"+req.query);
          if(req.query.code != undefined){
          var postCallResponse = await postCallForAccessToken(req.query.code);
          postCallResponse = JSON.parse(postCallResponse);
          var userId = postCallResponse.user_id;
          //console.log("postCallResponse access_token -- "+postCallResponse.access_token);
          var accessTokenLongResponse = await getAccessTokenLong(postCallResponse.access_token);
          accessTokenLongResponse = JSON.parse(accessTokenLongResponse);
          var fireStoreService = require('./fireStore');
          await fireStoreService.addNewUser(userId,accessTokenLongResponse.access_token)
          res.send('Yay.... We got you. Now your any new post will be shared to the Discord channel. If you are signing up for service for the first time. So, to get started we will be sharing your latest post to the channel. Enjoy!!!!!');
        }
        else{
          res.send('Hello my boi');
        }
    }
    catch(error){
      console.log(error);
      res.send(error);
    }
});
var server = http.createServer(exp);

server.listen(PORT,(req, res)=>{
                    console.log('Server listening in '+ PORT);
                    startKeepAlive();
                    });

function startKeepAlive(){
  keepAliveTimeId = setInterval(async function() {
    console.log("Pinging to herokuapp");
    var url = 'https://insta-discord.herokuapp.com/';
    unirest.get(url)
    .end(function(res) {
      if (res.error) {
        console.log('error in pinging') ;
      }
      else {
        console.log("Pinging done with response - "+ res.raw_body);
     }
   });
 }, 60000*10);//keep pinging server in 10 min
}

function postCallForAccessToken(code){
  console.log('postCallForAccessToken  --');
  return new Promise(async (resolve,reject)=>{
      var req = unirest('POST', 'https://api.instagram.com/oauth/access_token')
            .field('client_id', process.env.fbclient_id)
            .field('client_secret', process.env.fbclient_secret)
            .field('grant_type', 'authorization_code')
            .field('redirect_uri', process.env.fbredirect_uri)
            .field('code', code)
            .end(function (res) {
              if (res.error) {
                console.log(res.error);
                console.log(res.raw_body);
                return reject(res.error);
              }else{
                return resolve(res.raw_body)
              }
            });
  });
}

function getAccessTokenLong(accessToken){
  console.log('getAccessTokenLong  -- ');
  return new Promise(async (resolve,reject)=>{
      var req = unirest('GET', 'https://graph.instagram.com/access_token?access_token='+accessToken+'&client_secret='+process.env.fbclient_secret+'&grant_type=ig_exchange_token')
            .end(function (res) {
              if (res.error) {
                console.log(res.error);
                console.log(res.raw_body);
                return reject(res.error);
              }else{
                console.log(res.raw_body);
                return resolve(res.raw_body)
              }
            });
  });
}
