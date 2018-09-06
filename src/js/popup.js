
 //声明各种变量
const addBtn = document.getElementById("add");
const input = document.getElementById("input");
const ul = document.getElementById("ul");

const business = document.getElementById("business");
const today_topic = document.getElementById("today-topic");
const talks_list = document.getElementById("talks-list");
const stock_hot = document.getElementById("stock-hot");
const most_profitable = document.getElementById("most-profitable");
const fund_hot_list = document.getElementById("fund-hot-list");
const recommend_user = document.getElementById("recommend-user");
const reward = document.getElementById("reward");
const other_service = document.getElementById("other-service");
const info_report = document.getElementById("info-report");
const snbim_mainview = document.getElementById("snbim-mainview");
// const footer = document.getElementById("footer");
// const left = document.getElementById("left-col");
const right = document.getElementById("right-col");

const unfold = document.getElementById("unfold");

//初始化全局变量，用于存储数据，popup 里的数据都从这里取
const popup = {
    keywords: [],//关键词
};

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
    sendResponse('我是 popup，我已收到你的消息：' + JSON.stringify(request));
    console.log('init data');

    //渲染关键词列表
    popup.keywords = request.keywords;
    renderList(popup.keywords);

    //渲染模块屏蔽配置
     business.checked = !!(request.business==="hide");
     today_topic.checked = !!(request.today_topic==="hide");
     talks_list.checked = !!(request.talks_list==="hide");
     stock_hot.checked = !!(request.stock_hot==="hide");
     most_profitable.checked = !!(request.most_profitable==="hide");
     fund_hot_list.checked = !!(request.fund_hot_list==="hide");
     recommend_user.checked = !!(request.recommend_user==="hide");
     reward.checked = !!(request.reward==="hide");
     other_service.checked = !!(request.other_service==="hide");
     info_report.checked = !!(request.info_report==="hide");
     snbim_mainview.checked = !!(request.snbim_mainview==="hide");
    //  footer.checked = !!(request.footer==="hide");
    //  left.checked = !!(request.left==="hide");
     right.checked = !!(request.right==="hide");

     //渲染是否全部展开
     unfold.checked = !!(request.unfold==="unfold");

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

const moduleEventCallback = (e, cmd) => {
    const type = "module";
    const value = e.target.checked?"hide":"show";
    sendMessageToContentScript({ type, cmd, value }, function(response){
        // console.log('来自content的回复：'+response);
    });
}

//事件监听 - 模块屏蔽
[
    {element: business, cmd: "business"},
    {element: today_topic, cmd: "today_topic"},
    {element: talks_list, cmd: "talks_list"},
    {element: stock_hot, cmd: "stock_hot"},
    {element: most_profitable, cmd: "most_profitable"},
    {element: fund_hot_list, cmd: "fund_hot_list"},
    {element: recommend_user, cmd: "recommend_user"},
    {element: reward, cmd: "reward"},
    {element: other_service, cmd: "other_service"},
    {element: info_report, cmd: "info_report"},
    {element: snbim_mainview, cmd: "snbim_mainview"},
    // {element: footer, cmd: "footer"},
    // {element: left, cmd: "left"},
    {element: right, cmd: "right"},
].forEach(item => {
    item.element.addEventListener("click", e => moduleEventCallback(e, item.cmd));
});

//事件监听 - 是否全部展开
unfold.addEventListener("click", function(e){
    const value = e.target.checked?"unfold":"fold";
    sendMessageToContentScript({ cmd: "unfold", value }, function(response){
        // console.log('来自content的回复：'+response);
    });
})