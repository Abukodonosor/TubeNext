

document.addEventListener('DOMContentLoaded', documentEvents  , false)
var port = chrome.runtime.connect({name: "backgroundMecha"});

// Function which is triggered on document load
function documentEvents() {    
    
    port.postMessage({methodType: "songList"});

}

port.onMessage.addListener(function(msg) {
    if(msg.response == false)
        return;

    printListOfScheduledSongs(msg);
});


function printListOfScheduledSongs(data){
    let listOfSongs =  data.storageData;

    if( !listOfSongs )
        return false;

    let listContent = document.getElementsByClassName("song-list")[0];
    let allItemsHTML = listOfSongs.reduce( (accumulator, el) =>
        accumulator + makeHTMLitem(el)
    , "");
    listContent.innerHTML = allItemsHTML;
};

// Template for html song list
function makeHTMLitem(item){
    return `
        <div class="song-item">
            <h4>${item.title}</h4>
            <button>remove</button>
        </div>
        `;
};
