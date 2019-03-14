/* ===== Request Class ==============================
|  Class with a constructor for Request    |
|  ===============================================*/

class Request{
   constructor(){
      this.walletAddress = "";
      this.requestTimeStamp = "";
      this.message="";
      this.validationWindow = ""
   }
}

module.exports.Request = Request;
