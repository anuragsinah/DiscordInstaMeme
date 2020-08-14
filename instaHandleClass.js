var unirest = require('unirest');

/*
 *  For doing the http get call
 *  chat.postEphemeral to the user who used slash command
 */
const doGetCall = (url) => {
  console.log("doGetCall- "+url);
  return new Promise(async (resolve,reject)=>{
     unirest.get(url)
     .end(function(res) {
       if (res.error) {
         console.log('GET error') ;
          return reject('GET error' + res.error);
       }
       else {
         console.log("resolve done for url");
         return resolve(res);
      }
     });
  });
};

class instaHandleClass{
  lastPublishedMediaDate=Date.parse(0);
  setTimerIdRefreshToken;
  intervalTimerIdMedia;
  constructor(client,accessTokenLong) {
    this.client=client
    this.accessTokenLong = accessTokenLong;
  }

  startService(){
    this.startRefreshTokenPolling();
  }

  stopService(){
    clearTimeout(this.setTimerIdRefreshToken);
    clearTimeout(this.intervalTimerIdMedia);
  }


  async startMediaPolling() {

  	console.log('startMediaPolling') ;
    var that = this;
  	this.intervalTimerIdMedia = setInterval(async function() {
      try{
          var url = "https://graph.instagram.com/me/media?fields=media_url,caption,timestamp,media_type,id,permalink,thumbnail_url&"+"access_token="+that.accessTokenLong;
          var response = await doGetCall(url);
          that.mediaResponse(response);
        }
        catch(error){
          console.error('Error in the get call '+ error);
          clearTimeout(that.intervalTimerIdMedia);///stop polling if error occoured
        }
  	}, 300000);// poll insta in every 5min
  }

  mediaResponse = (res) => {
        try{
          var body = res['body'];
          console.log('api call done');
          var i;
          for(i=0;i<body['data'].length;i++){
            var publishedMediaDate = Date.parse(body['data'][i]['timestamp']);
            var diffDate = publishedMediaDate- this.lastPublishedMediaDate;
            console.log(diffDate);
            if(diffDate>0){
              if(body['data'][i]['media_type']=== "IMAGE" || body['data'][i]['media_type']=== "VIDEO"){
                    console.log('New data IMAGE- caption'+body['data'][i]['caption']);
                    this.lastPublishedMediaDate = publishedMediaDate;
                    this.client.channels.cache.get(process.env.channedID).send(body['data'][i]['permalink']);
                    break;////as we don't want to spam on the channel
                }
              }
            }
          }
          catch(err){
            console.log("Error in the received data");
            console.log(err);
          }
  }

  async startRefreshTokenPolling() {
  	console.log("startRefreshTokenPolling");
    var that =this;
  	try{
      var url = "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token="+this.accessTokenLong;
  		var response = await doGetCall(url);
      var expiresIn = response['body']['expires_in'];
      this.accessTokenLong = response['body']['access_token'];
  		this.startMediaPolling();
  		console.log("New expiry time - "+expiresIn);
  		this.setTimerIdRefreshToken = setTimeout(function() {
  											console.log("setTimeout for refresh token");
  									    clearTimeout(that.intervalTimerIdMedia);
  											that.startRefreshTokenPolling();
  								},expiresIn-10000);//refresh it 10 second of expiry
  	}catch(err){
  		console.log("can not start startRefreshTokenPolling");
  	}
  }
}
module.exports = instaHandleClass
