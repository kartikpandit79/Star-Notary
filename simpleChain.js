/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
// Included levelSandbox methods which has the level NodeJS library and is used as the data interaction layer.
const levelDB = require('./levelSandbox.js');
//Include Block class
const BlockClass = require('./Block.js');


class Blockchain {
   constructor(){
      this.getBlockHeight().then(res=>{
         if(res<0){
            this.addBlock(new BlockClass.Block("This is the First Block --Grenesis Block"))
         }
      })
         .catch(err=>{console.log(err)})
   }

   getBlockHeight(){
      return new Promise((resolve,reject)=>{
         levelDB.getBlockCount()
            .then(res=>{resolve(res-1)})
            .catch(err=>{reject(err)})
      });
   }

   //Get Block
   getBlock(blockHeight){
      return new Promise((resolve,reject)=>{
         levelDB.getLevelDBData(blockHeight)
            .then(res=>{resolve(JSON.parse(JSON.stringify(res)))
            // console.log(JSON.parse(JSON.stringify(res)))
         })
            .catch(err=>{reject(err)})
      })

   }

   addBlock(newBlock){
      let self = this;
      return new Promise((resolve,reject)=>{

         self.getBlockHeight()
         .then(res=>{
            newBlock.time = new Date().getTime().toString().slice(0,-3);
            
            if(res>=0){
               newBlock.height = res+1;
               
               self.getBlock(res).then(result=>{
                  // console.log(result)
                  // console.log(JSON.parse(result))
                  newBlock.previousBlockHash = JSON.parse(result).hash;
                  
                  newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                  let blockCreated = newBlock;
                  levelDB.addDataToLevelDB(newBlock.height,JSON.stringify(newBlock))
                     .then(res=>{console.log(res);
                     resolve(blockCreated)})
                     .catch(err=>{console.log(err)})
               })
               .catch(err=>{console.log(err)})
               
               
            }else{
               newBlock.height = 0;
               newBlock.previousBlockHash = '0x';
               newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
               levelDB.addDataToLevelDB(0,JSON.stringify(newBlock))
                  .then(res=>{console.log(res)})
                  .catch(err=>{console.log(err)})               
            }
         })
      })
   }


   getBlockByHash(hash){
      return new Promise((resolve,reject)=>{
         levelDB.getBlockByHash(hash).then(res=>{resolve(res)})
            .catch(err=>{reject(err)})
      })
   }

   //get Block by wallet address, use to store the star data
   getBlockByWalletAddress(walletAddress){
      return new Promise((resolve,reject)=>{
         levelDB.getBlockByWalletAddress(walletAddress).then(res=>{resolve(res)})
            .catch(err=>{reject(err)})
      })
   }

   //Validate block

   validateBlock(blockHeight){
      let self = this
      return new Promise((resolve,reject)=>{
         //checking whether the block exist or not
         self.getBlockHeight().then(res=>{
            if(blockHeight<=res){
               //geting the block details
               self.getBlock(blockHeight).then (result=>{
                  let block = JSON.parse(result);
                  //calculting the hash
                  let blockHash = block.hash

                  //removing the hash from the block
                  block.hash = ""

                  let validBlockHash = SHA256(JSON.stringify(block)).toString()

                  //validating the 2 hash 
                  if(validBlockHash ===blockHash){
                     resolve(true)
                  }else{resolve(false)}

               })
                  .catch(err=>{reject(err)})

            }else{
               console.log("Block number does not exist")
            }
         })
      })
   }

   validateChain(){
      let self = this;
      let errorLog = [];
      let promises = [];

      self.getBlockHeight().then(result=>{
         let blockHeight = result;
         //if chain is empty
         if(blockHeight<0){
            console.log("No block present in the chain")
         }else{
            //for each validation, adding a promise to promises
            for (let i = 0; i<blockHeight;i++){
               //Generating a promise and putting in the array
               promises.push(new Promise((resolve,reject)=>{
                  //Now checking the blocks
                  let firstBlockIndex = i
                  let secondBlockIndex = i+1;

                  if(secondBlockIndex == blockHeight){
                     self.validateBlock(secondBlockIndex).then(res=>{
                        if(!res){errorLog.push(secondBlockIndex)}
                     })
                  }

                  //Checking each block seprately
                  self.validateBlock(firstBlockIndex).then(res=>{
                     if(!res){errorLog.push(firstBlockIndex)}

                     self.getBlock(firstBlockIndex).then(res=>{
                        return res
                     })
                     .then(result=>{
                        let firstBlock = result;

                        //fetching second block details
                        self.getBlock(secondBlockIndex).then(res=>{
                           let secondBlock = res;

                           //matching the hash
                           if(JSON.parse(firstBlock).hash !== JSON.parse(secondBlock).previousBlockHash){
                              errorLog.push(firstBlockIndex)
                           }
                           resolve()
                        })
                     })
                  })

                  
               }))
            }
            Promise.all[promises].then (()=>{
               if(errorLog.length>0){
                  console.log("Block Error" + errorLog.length)
                  console.log("Block" + errorLog)
                  return false;

               }else{
                  console.log("No error detected")
                  return true
               }
            })
            .catch(err=>{console.log(err)})
         }
      })
   }


      
}


let myBlockchain = new Blockchain();

// (function theLoop(i){
//    setTimeout(function(){
//       myBlockchain.addBlock(new BlockClass.Block("Kartik Udacity"))
//       i++;
//       // console.log(i)
//       if(i<4){theLoop(i)}
//    },200)
// })(0)

// myBlockchain.getBlock(0).then(res=>{console.log(res)})
// myBlockchain.getBlockHeight().then(res=>{console.log(res)})
// myBlockchain.getBlockByHash("1c7c75e1c0215cc393971ed50cac6574bd0c994bd9586588e8b271e98c097383").then(res=>{console.log(res)})

module.exports.Blockchain = Blockchain;
