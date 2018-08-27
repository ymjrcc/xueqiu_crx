/*
 * @Author: Yiming
 * @Date: 2018-08-27 13:43:45
 * @LastEditors: Yiming
 * @LastEditTime: 2018-08-27 13:45:43
 * @Description: 
 */

//渲染关键词列表
function renderList(keywords){
    if(Array.isArray(keywords) && keywords.length>0 && keywords[0]!==""){
        const list = keywords.map(word => `<li>${word}</li>`).join("");
        document.getElementById("ul").innerHTML = list;
    }else{
        document.getElementById("ul").innerHTML = "";
    }
}

//接收 content-script 传来的 localStorage 并初始化
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(localStorage.getItem("keywords")){
        //如果已经有 localStorage 就不用传了
        return;
    }
    localStorage.setItem("keywords", request.ls);
    const keywords = JSON.parse(request.ls);
    renderList(keywords);
	sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
});


const keywords = localStorage.getItem("keywords")?JSON.parse(localStorage.getItem("keywords")):[];
renderList(keywords);

const addBtn = document.getElementById("add");
const input = document.getElementById("input");
const ul = document.getElementById("ul");

//封装传递函数
function sendMessageToContentScript(message, callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, message, function(response){
			if(callback) callback(response);
		});
	});
}

//初始化，通知 content-script 传递初始化数据过来
sendMessageToContentScript({cmd: 'init'}, function(response){
    console.log('收到了来自content的 init 数据：'+response);
}); 

//添加关键词
function addWord(){
    const newWord = input.value;
    const keywords = localStorage.getItem("keywords")?JSON.parse(localStorage.getItem("keywords")):[];
    
    if(newWord && keywords.findIndex(item => item === newWord) === -1){//有值且不和已有的重复
    
        const newKeywords = [...keywords, newWord];
        renderList(newKeywords);
        localStorage.setItem("keywords", JSON.stringify(newKeywords));
        input.value = "";
    
        //将新关键词列表传递给 content-script
        sendMessageToContentScript({cmd: 'keywordsChange', value: newKeywords}, function(response){
            // console.log('来自content的回复：'+response);
        });     
    }
}

addBtn.addEventListener("click", function(){
    addWord();
});

document.onkeyup = function (e) {
    const code = e.charCode || e.keyCode;
    if (code == 13) {//敲回车后
        addWord();
    }
}

//取消对某个关键词的屏蔽
ul.addEventListener("click", function(e){
    //事件委托
    if(e.target.tagName==='LI'){
        const word = e.target.textContent;
        const keywords = localStorage.getItem("keywords")?JSON.parse(localStorage.getItem("keywords")):[];

        //重新生成关键词列表
        const newKeywords = keywords.filter(i => i!==word);
        renderList(newKeywords);
        localStorage.setItem("keywords", JSON.stringify(newKeywords));

        //将新关键词列表传递给 content-script
        sendMessageToContentScript({cmd: 'keywordsChange', value: newKeywords}, function(response){
            // console.log('来自content的回复：'+response);
        });
    }
})