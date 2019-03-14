/* ===== Block Class ==============================
|  Class with a constructor for block    |
|  ===============================================*/


class Block {
   constructor(data){
      this.body = data,
      this.height = 0,
      this.time = 0,
      this.previousBlockHash = "",
      this.hash = ""
   }
}

module.exports.Block = Block;
