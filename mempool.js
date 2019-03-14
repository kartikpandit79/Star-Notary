/* ===== Mempool Class ==============================
|  Class with a constructor for Mempool    |
|  ===============================================*/

const bitcoinMessage = require('bitcoinjs-message');

class Mempool{
   constructor(){
      this.lookup = {}; //for faster lookup of request
      this.validRequestLookup ={}; // for faster lookup of valid request
      this.mempool = [];
      this.timeoutRequests = [];
      this.mempoolValid = [];
      this.timeoutMempoolValid = [];
      this.pointer;
   }

   getCurrentTime (){
      return new Date().getTime().toString().slice(0,-3);
   }

   addRequestValidation (request){
      // console.log(request)
      let self = this;
      const TimeoutRequestWindowTime = 5*60*1000 //5 min window time
      //check if the request is already present in the mempool
      let index = this.lookup[request.walletAddress]; // most likely output will be undefined for first value
      // console.log(index)//<- value will be undefine
      

      let mempoolIndex = this.validRequestLookup[request.walletAddress]; // most likely output will be undefined for first value
     
      
      
      if(mempoolIndex != null){  // this will be false for the first value or empty object(not considering genesis block),means if we have some value in the mempool we will execute this code
         return "please submit the star data before the request expires. A valid request has already made and signature is verified, ";
      }
      
      if(index == null){ // this will be true for empty object, means we will add value in the index object
         //Adding new request to the mempool, but first calculate the set time out value
         this.pointer = this.getCurrentTime()
         
         let timeElapse = this.pointer-request.requestTimeStamp;
         // console.log("2.TimeElapse---->"+ timeElapse)   // kartik
         let timeLeft = (TimeoutRequestWindowTime/1000)-timeElapse;
         // console.log("3.ValWind---->"+ timeLeft)  // kartik
         request.validationWindow = timeLeft;  // time left to validate your block
         
         
         
         //adjusting index value
         index = this.mempool.push(request)-1;   // now we are adding value to mempool, this will make index value = 0
         
         //For faster Lookup of the request
         this.lookup[request.walletAddress]= index;  //lookup = {request.walletAddress(add details) : 0} this will be the value of lookup table
         // console.log(this.lookup)  //this.lookup value is { '176XX1KmRAYC4V9XxzUK3Zk6ALGiCegqMv': 0 }
         //timeout of 5 minutes
         //Timeout Request is an array, we are adding wallet address as a parameter in our array.
         //This will remove our entry after 5 minutes
         
         this.timeoutRequests[request.walletAddress]= setTimeout(function (){self.removeValidationRequest(request.walletAddress)},TimeoutRequestWindowTime);
         
         return request       
      } else{
         //updating the already created request in the mempool with new validation window.
         let reqObj = this.mempool[index]; // means my wallet address value will to give to reqObj
         reqObj.requestTimeStamp = this.mempool[index].requestTimeStamp;
         // console.log("4.reqObj Tstamp---->"+ `${reqObj.requestTimeStamp}`)  // kartik
         
         let timeElapse = (this.getCurrentTime())-reqObj.requestTimeStamp;
         // console.log("5.1 reqObj Telapse---->"+timeElapse)  // kartik
         
         let timeLeft  = (TimeoutRequestWindowTime/1000) - timeElapse;
         // console.log("5.2 reqObj tLeft---->"+ timeLeft)   // kartik
         
         
         reqObj.validationWindow = timeLeft;
         console.log(reqObj)
         return reqObj;
      }
   }

   removeValidationRequest(address){
      //cleaning up the mempool, lookup table and timeoutRequest array
      let index = this.lookup[address]; // undefine for empty index object
      console.log(index)
      delete this.lookup[address];
      delete this.mempool[index];
      clearTimeout (this.timeoutRequests[address]);
      delete this.timeoutRequests[address]
   }
   
   validateRequestByWallet(address,signature,timeStamp){
      
      let self = this;
      const TimeoutMempoolValidWindowTime = 5*60*1000;  // time is set for 30 mins
      //check if the request already present in the mempool
      let index = this.lookup[address];
      
      console.log(index);
      
      if(index == null){
         return "Please submit a temporal validation request";
      }else{
         let message = this.mempool[index].message;


         
         try{
            
            if(bitcoinMessage.verify(message,address,signature)){
               
               let memPoolValidIndex = this.validRequestLookup[address]
               if(memPoolValidIndex == null){
                  clearTimeout(this.timeoutRequests[address]);
                  delete this.timeoutRequests[address];
                  let timeElapse = (this.getCurrentTime())-timeStamp;
                  // console.log("6.sig TimeElapse---->"+ timeElapse)    // kartik
                  // console.log("7.sig Tstamp:---->"+ timeStamp)    // kartik
                  // let requestObj = this.mempool[index]
                  // requestObj.validationWindow = this.mempool[index].validationWindow
                  
                  let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
                  // console.log("8. tLeft---->"+ timeLeft)     // kartik

                  let tempObj = {
                     "registerStar": true,
                     "status": {
                        "address": address,
                        "requestTimeStamp": timeStamp,
                        "message": message,
                        "validationWindow": timeLeft,
                        "messageSignature": true
                     }
                  };
                  // console.log(tempObj)
                  memPoolValidIndex = this.mempoolValid.push(tempObj)-1;

                  //for faster lookup of the request
                  this.validRequestLookup[address]= memPoolValidIndex;

                  //timeout of 30 minutes
                  this.timeoutMempoolValid[address] = setTimeout(function(){self.removeValidRequest(address)}, TimeoutMempoolValidWindowTime);
                  return tempObj;
               } else{
                  let timeElapse = (this.getCurrentTime())-this.mempoolValid[index].status.requestTimeStamp;
                  let timeLeft = (TimeoutMempoolValidWindowTime/1000)- timeElapse;
                  

                  this.mempoolValid[index].status.validationWindow = timeLeft;
                  return this.mempoolValid[index];
               }

            } else{
               return "Signature not valid";
            }

         }
         catch(err){
            return "Please verify the signature length"
         }
      }

   }

   removeValidRequest(address){
      //cleaning up the mempool, lookup table and timeoutRequest array

      this.removeValidationRequest(address);
      let index = this.validRequestLookup[address];
      delete this.validRequestLookup[address];
      delete this.mempoolValid[index];
      clearTimeout(this.timeoutMempoolValid[address])
      delete this.timeoutMempoolValid[address]
   }
   
   verifyAddressRequest(address){
      let index = this.validRequestLookup[address];
      if(index == null){
         return false
      }else{
         return true
      }
   }

   verifyStarParameters(star){
      let obj = {};

      if(!("ra"in star)){
         obj.ra = "RA parameter missing"
      }else{
         if((star.ra.length == 0)){
            obj.ra = "RA is empty"
         }
      }

      if(!("dec" in star)){
         obj.dec = "DEC parameter is missing"
      }else{
         if((star.dec.length == 0)){
            obj.dec = "DEC is empty"
         }
      }

      if(!("story" in star)){
         obj.story = "STORY parameter is missing"
      }else{
         if(star.story.length == 0 || star.story.length>=500){
            obj.story = "Story is empty or greater than 500 words length"
         }
         let str = star.story;
         for(let i = 0;i<str.length;i++){
            if(str.charCodeAt(i)>127){
               obj.storyType = "Text entered is not ASCII"
            }
         }

      }

      let objLength = Object.keys(obj).length;
      if(objLength>0){
         return {
            "result":false,
            "error":obj
         }
      }else{
         return {
            "result": true
         }
      }




   }

   forTesting(){
      console.log(this.mempool)
      console.log(this.lookup)
      console.log(this.timeoutRequests)
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

      console.log(this.mempoolValid);
      console.log(this.validRequestLookup);
      console.log(this.timeoutMempoolValid)
   }



   
}

module.exports.Mempool = Mempool;
