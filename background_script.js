/*
  Local storage mechanism like que for listening song

*/
const YouTubeNextStoreKeyName = "NextTube"
console.log("Background");

//receive data from contentScript
chrome.runtime.onConnect.addListener(async function(port) {
  console.assert(port.name == "backgroundMecha");
  
  port.onMessage.addListener(async function(msgData) {
    var data;
    var result;

    data = await YouTubeStorageMecha.start();
    // console.log(msgData);

    let methodName = msgData.methodType;
    switch(methodName){
        case 'addSong':
          result = await MechaFunc.updateStorage(msgData);
          console.log(result)
          break;
        case 'nextSong':
          data = await MechaFunc.getNextSong();
          port.postMessage(data);
          break;
        case 'songList':
          data = await MechaFunc.getStorage();
          port.postMessage(data);
          break;
      default:
        console.log("Unsuspected state of methodType!!");
    }
    
  });
  
});

class YouTubeStorageMecha {
  
  static start(inputData){
    return MechaFunc.init();
  }

}

class MechaFunc {

  //re init LocalStorage
  static async reInitStorage(){

  }
    
  static async init(data){
    let existData = await MechaFunc.getStorage();
    return existData ? existData: await MechaFunc.setStorage();
  }

  //set storage logic
  static setStorage(inputData){ 
    return new Promise(resolve=>{
      let objSchema = {storageData: [] };
      let dataString = objSchema;
      var obj = inputData || {
        NexSongStorageMecha: dataString
      };
      chrome.storage.sync.set(obj, function() {
        // console.log('Value is set to');
        resolve(obj)
      });
    })
  }

  //get items from the storage
  static getStorage(){
    return new Promise(resolve=>{
      chrome.storage.sync.get(null, function(result) {
          if(result['NexSongStorageMecha']){
            let data = result['NexSongStorageMecha'];
            // console.log(data);
            resolve(data)
          }
        resolve(false)
      });
    });
  }

  //update the items of the storage
  static updateStorage(newData){
    return new Promise(async resolve=>{
      let data = await MechaFunc.getStorage();
      data.storageData.push(newData);
      let obj = {
        NexSongStorageMecha: data
      };

      let setData = await MechaFunc.setStorage(obj);
      resolve(setData)
    });
  }

  //next song for user to listen
  static async getNextSong(){
    return new Promise(async resolve=>{
      let currentData = await MechaFunc.getStorage();
      if( currentData == false){
        resolve({response :false, msg: "There are some kind of error"})
      }
  
      let nextSong = currentData.storageData.shift();
      if( nextSong == undefined){
        resolve({response: false, msg: "No more songs scheduled"});
      } 
  
      //return song which need to be played next
      let obj = {
        NexSongStorageMecha: currentData
      };
      await MechaFunc.setStorage(obj);
      resolve(nextSong)
    });
  }

}

