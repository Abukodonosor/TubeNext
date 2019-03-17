/* Client parsing script */

// window.location.href = "https://www.youtube.com/watch?v=0Yshh2bTOeA"
// document.getElementsByClassName("html5-main-video")[0].currentTime
// document.getElementsByClassName("html5-main-video")[0].duration


/* Need to be changed if youtube change his structure */
const HomeSelector = "yt-simple-endpoint inline-block style-scope ytd-thumbnail";
const SuggestSelector = "yt-simple-endpoint style-scope ytd-compact-video-renderer";

const TYPEhomePage = "homePage";
const TYPEvideoPage = "videoPage";
var port = chrome.runtime.connect({name: "backgroundMecha"});


window.onload = async(env) => {

    setInterval(()=>{
        let HomeSuggestionVideos = YouTubeUI.extractSuggestionVideos(HomeSelector);
        let ItemSuggestionVideos = YouTubeUI.extractSuggestionVideos(SuggestSelector);
    
        Factory.factoryNextSongOptions(YouTubeUI, HomeSuggestionVideos, TYPEhomePage);
        Factory.factoryNextSongOptions(YouTubeUI, ItemSuggestionVideos, TYPEvideoPage);

        YouTubeUI.trackVideoTime();
    },1000);

};

//receive from background script
port.onMessage.addListener(function(msg) {
       
    if(msg.response == false){
        console.log(msg.msg);
        return;
    }
    window.location.href = msg.url;
});

function doAction(url){
    alert("The song is added to que");
    port.postMessage({methodType: "addSong", url: url});
}

function nextSong(){
    port.postMessage({methodType: "nextSong"});
}

/* Factory for inserting button widgets */
class Factory {
    
    constructor() {}
    
    //attach ui elements to its content
    static factoryNextSongOptions(className, items, placeForWidget){
        
        const {marked, render} = calculateWidgetCoverage()
        if(render)
            for(let i = marked; i < items.length; i++){
                if( placeForWidget == TYPEhomePage){
                    items[i].parentElement.nextElementSibling.appendChild(new className(items[i].href, placeForWidget))
                }
                else if ( placeForWidget == TYPEvideoPage){
                    items[i].parentElement.appendChild(new className(items[i].href, placeForWidget))
                }
            }
        return items;
    }

}

class YouTubeUI {
    
    constructor(url, placeForWidget) {
        this.contentWrapper = document.createElement("div")
        this.contentWrapper.setAttribute('class', widgetWrapperClass(placeForWidget)+" nextTube");
        
        this.contentWrapper.append(new ButtonWidget('mark Next', doAction.bind(this, url), ""));
        this.contentWrapper.append(new ButtonWidget('unMark Next ', doAction.bind(this, url), ""));
        
        return this.contentWrapper;
    }

    static extractSuggestionVideos( classSelector){
        let allSuggestedVideos = document.getElementsByClassName(classSelector);
        return allSuggestedVideos
    }
    
    static trackVideoTime(){
        //select video element
        let videoSelector = document.getElementsByClassName("html5-main-video")[0];
        
        if(videoSelector == undefined)
            return false;
        
        //take data from video element, current time and end time of video
        let objectTracker = {
            currentTime: videoSelector.currentTime,
            endTime: videoSelector.duration
        };

        if(objectTracker.currentTime == objectTracker.endTime)
            nextSong();
        
        console.log(objectTracker);
    }


}

/* Button for UI on youtube suggestion clips */
class ButtonWidget {
    
    constructor(innerText, onClickEvent, styleClass) {
        this._buttonHtml = document.createElement("button");
        this._buttonHtml.appendChild(
            document.createTextNode(innerText)
            );
        this._buttonHtml.onclick = onClickEvent;
        this._buttonHtml.setAttribute('class', styleClass);
        return this._buttonHtml;
    }

    setButtonTitle(newTitle){
        this._buttonHtml.innerText = newTitle;
    }
    
    getButtonTitle(){
        return this._buttonHtml.innerText;
    }

}

/* html class schema for adding element to existing structure  (need to be changed if youtube change its structure)*/
function widgetWrapperClass(place){
    let className;
    switch(place){
        case TYPEhomePage:
            className = 'style-scope ytd-video-renderer';
            break;
        case TYPEvideoPage:
            className = 'metadata style-scope ytd-compact-video-renderer';
            break;
        }
    return className;
}   

function calculateWidgetCoverage(){
    let marked = document.getElementsByClassName("nextTube").length;
    let render = items.length - marked;
    return {marked, render}
}


// class PlayNextComponent {
//     constructor (selector, pageTpe){
//         this.allSuggestedSelector = selector
//         this.suggestionType =  pageTpe;
//     }

// }

/* YouTube UI catcher and parser */