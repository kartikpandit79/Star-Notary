const hapi = require('hapi')


class BlockAPI{

   constructor(){
      this.server = hapi.server({
         port: 8000,
         host: 'localhost'
      })
      this.start();
      this.initController();
   }

   initController(){
      require('./blockController.js')(this.server);
      require('./mempoolController.js')(this.server)
   }
   async start(){
      await this.server.start()
      console.log("Running server at "+ this.server.info.uri)
   }

}


new BlockAPI()
