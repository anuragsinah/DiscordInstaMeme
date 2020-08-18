'use strict';
const admin=require('firebase-admin');
var instaHandleService = require('./instaHandleClass');

var serviceAccount = {
  "type": "service_account",
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key.replace(/\\n/g, '\n'),
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.client_x509_cert_url
};

var client;

var userPermissionApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var services=[];
let db = userPermissionApp.firestore();

var userData = {};
function startSnapshortUser(clientBot){
	console.log('startSnapshortUser');
    client=clientBot;
  	db.collection('instaUser').onSnapshot(function(snapshot){
     userData = {};
     snapshot.forEach((doc) => {
       console.log("New snapshort");
       console.log(doc.id, '=>');
	     userData[doc.id]=doc.data();
    });
		services=services.filter(checkAccount);///first filter out all the user which are not present and stop their services
		addUser();//now check for new user and start their service
  });
}

function checkAccount(account) {
  console.log("doing filter for services wih userId"+ account.getUserId());
	var found = false;
	for (let key in userData) {
		console.log("key - "+ key+" id- "+account.getUserId());
		//console.log("key - "+typeof key+" id- "+typeof account.getUserId());
		console.log(key === account.getUserId());
		if(key === account.getUserId()){
			found = true;
			break;
		}
  }
	if(found){
		console.log("found the key- "+ account.getUserId());
		return true;
	}else{
		console.log("not able to find the key- "+ account.getUserId());
		account.stopService();
		account=null;
		return false;
	}
}

function addUser(){
	console.log("addUser");
	var i;
	var arr=[];
	for (let key in userData) {
		var found = false;
		console.log("cheking for key - "+key);
		 for(i=0;i<services.length;i++){
			 console.log("checking for key for  "+services[i].getUserId());
			 if(key === services[i].getUserId()){
				 found=true;
				 break;
			 }
		 }
		console.log("value of found "+ found);
		 if(!found){
			 console.log("did not found "+key);
			 arr.push(key);
		 }
	 }
	for(i=0;i<arr.length;i++){
		services.push(new instaHandleService(arr[i],client,userData[arr[i]]['accessToken'],userData[arr[i]]['lastPublishedMediaDate']));
		services[services.length-1].startService();
	}
}

async function updateAccessToken(userId,accessToken){
	try{
    await db.collection('instaUser').doc(userId).set({
          accessToken : accessToken }, { merge: true });
	}
	catch(err){
		console.error(err);
	}
}

async function updatelastPublishedMediaDate(userId,lastPublishedMediaDate){
	try{
    await db.collection('instaUser').doc(userId).set({
          lastPublishedMediaDate : lastPublishedMediaDate }, { merge: true });
	}
	catch(err){
		console.error(err);
	}
}

async function addNewUser(userId,accessToken){
  console.log('addNewUser userId--' +userId+ ' accessToken --'+ accessToken);
  return new Promise(async (resolve,reject)=>{
    	try{
        await db.collection('instaUser').doc(userId.toString()).set({
              accessToken : accessToken}, { merge: true });
        return resolve();
    	}
    	catch(err){
    		console.error(err);
        return reject();
    	}
  });
}

module.exports = {startSnapshortUser,updateAccessToken,updatelastPublishedMediaDate,addNewUser};
