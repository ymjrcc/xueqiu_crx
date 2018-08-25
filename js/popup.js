function renderList(keywords){
    if(Array.isArray(keywords) && keywords.length>0 && keywords[0]!==""){
        const list = keywords.map(i => `<li>${i}</li>`).join("");
        document.getElementById("ul").innerHTML = list;
    }
}

//接收 content-script 传来的 localStorage 并初始化
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(localStorage.getItem("keywords")){
        //如果已经有 localStorage 就不用传了
        return;
    }
    console.log('收到来自content-script的消息：');
    localStorage.setItem("keywords", request.ls);
    const keywords = JSON.parse(request.ls);
    renderList(keywords);
	sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
});


const keywords = localStorage.getItem("keywords")?JSON.parse(localStorage.getItem("keywords")):[];
console.log(keywords);
renderList(keywords);

const addBtn = document.getElementById("add");
const input = document.getElementById("input");

function sendMessageToContentScript(message, callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, message, function(response){
			if(callback) callback(response);
		});
	});
}

addBtn.addEventListener("click", function(){

    const newWord = input.value;
    const keywords = localStorage.getItem("keywords")?JSON.parse(localStorage.getItem("keywords")):[];
    
    if(newWord && keywords.findIndex(item => item === newWord) === -1){//有值且不和已有的重复

        const newKeywords = [newWord, ...keywords];
        renderList(newKeywords);
        localStorage.setItem("keywords", JSON.stringify(newKeywords));
        input.value = "";

        sendMessageToContentScript({value: newKeywords}, function(response){
            console.log('来自content的回复：'+response);
        });     

    }
});