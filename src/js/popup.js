/*
 * @Author: Yiming
 * @Date: 2018-08-27 13:43:45
 * @LastEditors: Yiming
 * @LastEditTime: 2018-08-27 13:45:43
 * @Description: 
 */

 //声明各种变量
const addBtn = document.getElementById("add");
const input = document.getElementById("input");
const ul = document.getElementById("ul");

const popup = {};//初始化全局变量，用于存储数据，popup 里的数据都从这里取

 //封装传递函数
function sendMessageToContentScript(message, callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, message, function(response){
			if(callback) callback(response);
		});
	});
}

//渲染关键词列表
function renderList(list){
    if(Array.isArray(list) && list.length>0 && list[0]!==""){
        const str = list.map(item => `<li>${item}</li>`).join("");
        document.getElementById("ul").innerHTML = str;
    }else{
        document.getElementById("ul").innerHTML = "";
    }
}

//渲染各种配置信息
function renderConfigs(config){

}

//添加关键词
function addWord(){
    const newWord = input.value;
    
    if(newWord && popup.keywords.findIndex(item => item === newWord) === -1){//有值且不和已有的重复
    
        popup.keywords = [...popup.keywords, newWord];
        renderList(popup.keywords);
        
        //将新关键词列表传递给 content-script
        sendMessageToContentScript({cmd: 'keywordsChange', value: popup.keywords}, function(response){
            // console.log('来自content的回复：'+response);
        }); 
        
        //重置输入框
        input.value = "";
    }
}

//移除关键词
function removeWord(e){
    if(e.target.tagName==='LI'){//事件委托
        const word = e.target.textContent;

        //重新生成关键词列表
        const newKeywords = popup.keywords.filter(i => i!==word);
        popup.keywords = newKeywords;
        renderList(popup.keywords);

        //将新关键词列表传递给 content-script
        sendMessageToContentScript({cmd: 'keywordsChange', value: popup.keywords}, function(response){
            // console.log('来自content的回复：'+response);
        });
    }
}

//点开 pupop 页面，第一件事就是通知 content-script 传递初始化数据过来
sendMessageToContentScript({cmd: 'init'}, function(response){
    console.log('收到了来自content的 init 数据：'+response);
}); 

//接收 content-script 传来的 本地存储数据 并初始化
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    console.log('init data');
    popup.keywords = request.keywords;
    renderList(popup.keywords);
    sendResponse('我是 popup，我已收到你的消息：' + JSON.stringify(request));
});

//事件监听 - 添加关键词
addBtn.addEventListener("click", addWord);//点击按钮添加关键词

document.onkeyup = function (e) {//敲回车添加关键词
    const code = e.charCode || e.keyCode;
    if (code == 13) {//敲回车后
        addWord();
    }
}

//事件监听 - 取消对某个关键词的屏蔽
ul.addEventListener("click", removeWord);