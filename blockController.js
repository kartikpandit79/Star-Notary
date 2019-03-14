const BlockClass = require('./Block.js');
const ChainClass = require('./simpleChain.js');
const hextoascii = require('hex2ascii')


/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {
   /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server
     */
    constructor(server){
       this.server = server;
       this.blockchain = new ChainClass.Blockchain();
       
       this.getBlockByHash();
       this.getBlockByHeight();
       this.postNewBlock();
       this.getBlockByAddress();

    }

     /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByHeight(){
       let self = this.blockchain;
      //  console.log(this.blockchain)
       this.server.route({
          method: 'GET',
          path: '/block/{height}',
          handler: async (request,h)=>{
            try{
               let blockHeight = request.params.height;
               // console.log("::::::::::::::::::::::::::::::::::::::")
               console.log(blockHeight)
               if(blockHeight==null){
                  return "Block value is empty"
               }
               let promise = self.getBlock(blockHeight);
               let result = await promise;
               if(result!=null){
                  let blockResult = JSON.parse(result);
                  
                  if(blockResult.height !=0){
                     blockResult.body.star.storyDecoded = hextoascii(blockResult.body.star.story);
                     return blockResult;
                  }else{
                     return blockResult
                  }
               }else{
                  return "BLOCK NOT FOUND";
               }


            }
            catch(err){
               return ("Error in request processing PPPPPPPPPPPP")
            }

          }
       })
    }

     /**
     * Implement a GET Endpoint to retrieve a block by hash or url, url: "/api/stars"
     */
    getBlockByHash(){
      let self = this.blockchain;
      this.server.route({
         method: 'GET',
         path: '/stars/hash:{hash}',
         handler: async(request,h)=>{
            try{
               let blockHash = request.params.hash;
               // console.log(blockHash)
               
               if(blockHash == null){
                  return "Invalid Block"
               }
               if(blockHash.length == 0){
                  return "Block Hash is missing"
               }
               let promise = self.getBlockByHash(blockHash)
               let result = await promise;
               if(result != null){
                  // console.log(result)
                  let blockResult = JSON.parse(result.value)
                  // console.log("-------------------------------")
                  if(blockResult.height !=0){
                     blockResult.body.star.storyDecoded = hextoascii(blockResult.body.star.story)
                  }
                  return blockResult
               }else{
                  return "NO Block found"
               }

            }
            catch(err){
               return "Error in proceesing Hash request"
            }
         }
      })
    }

    getBlockByAddress(){
      let self = this.blockchain;
      this.server.route({
         method: 'GET',
         path: '/stars/address:{address}',
         handler: async(request,h)=>{
            try{
               let blockAddress = request.params.address;
               
               if(blockAddress == null){
                  return "Invalid Address"
               }
               if(blockAddress.length == 0){
                  return "Address is Empty"
               }
               let promise = self.getBlockByWalletAddress(blockAddress)
               let result = await promise;
               // now result will be an array
               // if(result != null){
                  // let extract = JSON.parse(result)
                  console.log(result)
                  let res = []
                  for(let i =0;i<result.length;i++){
                     // console.log("------------")
                     let addValue = JSON.parse(result[i])
                     console.log(addValue)
                     // if(addValue.height !=0){
                        addValue.body.star.storyDecoded = hextoascii(addValue.body.star.story)
                        res.push(addValue)
                     // }
                  }
                  return res
               }

            // }
            catch(err){
               return "Error while processing your request"
            }
         }
      })
    }

    postNewBlock(){
       let self = this.blockchain
       this.server.route({
          method: 'POST',
          path: '/block',
          handler: async function (request,h){
             try{
               let blockData = request.payload.body;
               if(blockData == null){
                  return "No Block data added"
               }
               if(blockData.length == 0){
                  return "Block Data enter is empty"
               }
               let promise = self.addBlock(new BlockClass.Block(blockData));
               let result = await promise;
               return result
             }
             catch(err){
               return "Error in adding new block"
             }
          }
       })
    }

}


module.exports = (server)=>{return new BlockController(server)}
