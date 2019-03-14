const MempoolClass = require('./mempool.js');
const RequestClass = require('./request.js');
const BlockClass = require('./Block.js');
const hextoascii = require('hex2ascii');


class MempoolController{
   constructor(server){
      this.server = server;
      this.mempool = new MempoolClass.Mempool();
      // console.log(this.mempool.validateRequestByWallet())
      this.count;
      this.arr = []
      
      this.requestValidation ()
      this.validateSignature()
      this.storeStarData()
      this.test()
      
   }


    /**
     * Implement a POST Endpoint to validation request, url: "/api/requestValidation"
     */

     requestValidation(){
        this.server.route({
           method:'POST',
           path: '/api/requestValidation',
           handler: async (request,h)=>{
            try{
               let address = request.payload.address;
               // console.log(address)
               //check whether the address variable is empty
               if(address == null){
                  return "Invalid Address"
               }
               if(address.length==0){
                  return "Provide a valid address"
               }

               //creating request object
               let req = new RequestClass.Request();
               req.walletAddress = address;
               req.requestTimeStamp = (new Date().getTime().toString().slice(0,-3));
               this.count = req.requestTimeStamp;
               console.log("1. value count---->"+ this.count)
               this.arr.push(this.count)
               req.message = req.walletAddress+ ":"+ req.requestTimeStamp+ ":"+ "starRegistry";

               //Adding request to mempool
               // console.log(req)
               // console.log(new MempoolClass.Mempool())
              
               // console.log(this.mempool.addRequestValidation(req))
               return this.mempool.addRequestValidation(req);
            }
            catch(err){
               console.log(err)
               return "Validation request cannot be created"
            }
           }
        })
     }

     /**
     * Implement a POST Endpoint to validate signature, url: "/api/message-signature/validate"
     */
validateSignature(){
   this.server.route({
      method: 'POST',
      path:'/api/message-signature/validate',
      handler: async (request,h)=>{

         try{
            let address = request.payload.address;
            let signature = request.payload.signature
            // let timeStamp = request.payload.timeStamp;4


            if(!address||!signature){
               return "Address or signature is missing"
            }

            // let timeStamp = new Date()

            // if(address == null || signature == null || timeStamp == null){   //kartik
            //    return "Invalid Parameter"
            // }
            // if(address.length == 0||signature.length ==0 || timeStamp == 0){  //kartik
            //    return "Empty value cannot be passed"
            // }
            let timeStamp = this.arr[0]// (new Date().getTime().toString().slice(0,-3))
            // console.log("sign timeStamp :" + timeStamp)    // kartik
            // console.log(this.mempool.addRequestValidation())
            // console.log(">>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<")
            return this.mempool.validateRequestByWallet(address,signature,timeStamp)
         }
         catch(err){
            return err

         }
      }
   })
}

    // To store the star details in the chain. URL :/api/block
    storeStarData(){
       this.server.route({
          method:"POST",
          path: '/api/block',
          handler: async (request,h)=>{
             try{
               //check for single star details
               let requestObj = request.payload;
               console.log("b. requestObj---->"+ requestObj)

               //verifing the count of parameter
               let noOfParameters = Object.keys(requestObj).length;

               if(noOfParameters==2){
                  //fetching address and star details from the request
                  let address = request.payload.address
                  let starData = request.payload.star;

                  //verifying whether the address is  validated in the past 30 minutes
                  if(this.mempool.verifyAddressRequest(address)){ 
                     let paramcheck  = this.mempool.verifyStarParameters(starData)
                     if(paramcheck.result == false){
                        return paramcheck.error;
                     }
                     if(!("mag" in starData)){
                        starData.mag = ""
                     }

                     if(!("cen" in starData)){
                        starData.cen = ""
                     }

                     let body  = {
                        "address": address,
                        "star": {
                           "ra": starData.ra,
                           "dec": starData.dec,
                           "mag": starData.mag,
                           "cen": starData.cen,
                           "story": new Buffer(starData.story).toString('hex')
                        }

                       
                     }

                      //Calling the postNewBlock API in blockController
                      const injectOption = {
                         method: 'POST',
                         url: '/block',
                         payload: {
                            body:body
                         }
                      }

                      const response = await this.server.inject(injectOption);
                     //  console.log("a. response---->"+ response)
                      let blockResult = JSON.parse(response.payload);
                      //Adding decoded story to the object
                     //  blockResult.body.star.storyDecoded = hextoascii(blockResult.body.star.story);
                      this.mempool.removeValidRequest(address);
                      return blockResult
                  } else{
                     return "Please send validation request once again"
                  }
               }else{
                  return "Please send a valid address and details of a single star "
               }
             }
             catch(err){
               console.log(err)
             }
          }
       })
    }


    test(){
       this.server.route({
          method: 'POST',
          path: '/api/test',
          handler: async (request,h)=>{
             try{
               let address = request.payload.address;
               let starData = request.payload.star;

               return this.mempool.verifyStarParameters(starData)
             }
             catch(err){
               // return (err)
               console.log(err)
             }
          }

       })
    }







}
/**
 * Exporting the MempoolController class
 * @param {*} server
 */

 module.exports = (server)=>{return new MempoolController(server)}

 