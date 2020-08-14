
/* global ConversationPanel: true, PayloadPanel: true*/
/* eslint no-unused-vars: "off" */

var USER = null;

// Other JS files required to be loaded first: apis.js, conversation.js, payload.js
(function() {
  $.get({
    url: '/api/get_user',
    success: function(user_data) {
      USER = user_data;
      USER.profilePhoto = "https://faces.tap.ibm.com/imagesrv/"+USER.id+".jpg";
    },
    complete: function() {
      // Initialize all modules
      ConversationPanel.init();
      PayloadPanel.init();

      $("#userPhoto").css('background-image', 'url('+USER.profilePhoto+')');
    }
  });
})();

function restartChat(){
  document.querySelector("#scrollingChat").innerHTML="";
  Api.sendRequest("", {WORKSPACE_ID: Api.getResponsePayload().context.WORKSPACE_ID});
}

function changeToQuestion(){
  document.querySelector("#feedbackButtons").style.display="block";
  document.querySelector("label.inputOutline").style.display="none";
}

function buttonSend(value,backToText){
  Api.sendRequest(value, Api.getResponsePayload().context);
  if(backToText)
    changeToText();
}

function changeToText(){
  document.querySelector("#feedbackButtons").style.display="";
  document.querySelector("label.inputOutline").style.display="";
  document.querySelector("#textInput").focus()
}

function switchColor(){

  if ( document.querySelector("html").hasAttribute("style") ){
    localStorage.lightTheme = "false";
    document.querySelector("html").removeAttribute("style");
  }
  else{
    localStorage.lightTheme = "true";
    with(document.querySelector("html").style){
      setProperty("--text-color", "black");
      setProperty("--background-color", "#e0e0e0");
      setProperty("--chat-border-color", "#5596e6");
      setProperty("--chat-underline-color", "#41d6c3");
      setProperty("--chat-message-background-color", "#00b4a0");
    }
  }
  document.querySelector("#textInput").focus()
}

function switchVoice(){
  if ( document.querySelector(".voiceSwitch").hasAttribute("style") ){
    localStorage.cellyVoice = "true"
    document.querySelector(".voiceSwitch").removeAttribute("style");
  }else{
    localStorage.cellyVoice = "false"
    document.querySelector(".voiceSwitch").style.right=document.querySelector(".voiceSwitch").clientWidth+"px";
    talk("",0);
  }
  document.querySelector("#textInput").focus()
}

function talk(text, index, voiceParent){
  if(index==0){
    try{
      if(Array.isArray(cellyVoice)) { if(cellyVoice[0] instanceof Object) cellyVoice.forEach((item)=>{ item.pause() }) }
      else cellyVoice.pause();
    }catch(err){}
    cellyVoice = [text];
  } else
    cellyVoice.push(text)

  if(text){
    var ajax = new XMLHttpRequest();
    ajax.open("POST", "/api/talk/", true);
    ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajax.responseType = "arraybuffer";
    ajax.onload = function() {
      var blob = new Blob([ajax.response], {type: "audio/ogg"});
      var url = URL.createObjectURL(blob);
      cellyVoice[index] = new Audio(url);
      cellyVoice[index].playbackRate = 1.07;
      var playNext = ()=>{
        if(cellyVoice.length>index+1)
          try{ cellyVoice[index+1].play()
          } catch(e){ setTimeout(playNext,100) }
      }
      cellyVoice[index].onended = playNext;
      var repeat = document.createElement("span");
      repeat.id = "repeat"
      repeat.classList = "ds-icon-refresh-m-l"
      voiceParent = voiceParent.firstElementChild
      repeat.onclick = ()=>{
        if(Array.isArray(cellyVoice)) { if(cellyVoice[0] instanceof Object) cellyVoice.forEach((item)=>{ item.pause() }) }
        else cellyVoice.pause();
        cellyVoice = new Audio(url);
        cellyVoice.playbackRate = 1.07;
        cellyVoice.play();
      }
      voiceParent.appendChild(repeat)
      if ( !document.querySelector(".voiceSwitch").hasAttribute("style") && index==0 || cellyVoice[0] == index) cellyVoice[index].play();
    };
    ajax.send("text="+text);
  }
}

if(localStorage.lightTheme == "true")
  document.querySelector("#lightSwitch").click();
if(localStorage.cellyVoice == "false")
  document.querySelector("#cellyVoice").click()
document.querySelector("#textInput").focus()
