console.log('雪球关键词屏蔽器启动！');

//监听从 popup 发来的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	// console.log('收到新的关键词列表', request.value);
	//将 popup 传来的消息存入本地存储中
	localStorage.setItem("xq_crx_keywords", JSON.stringify(request.value));

	//执行一次过滤操作
	doFilter();	

	//告诉 popup 收到消息
	sendResponse('我收到了你的消息！');
});


let itemCount = 0;
const articles = document.getElementsByClassName("timeline__item");//信息块个数

const doFilter = () => {//执行过滤函数

	itemCount = articles.length;

	const texts = [...articles].map(article => {//每条信息块的文本格式
		const content = article.querySelectorAll(".content--description div");
		const text = [...content].map(div => div.textContent).join(" ");
		return text;
	})
	
	const filter = [];
	const keywords = JSON.parse(localStorage.getItem("xq_crx_keywords"));
	// console.log(keywords);

	//初始化消息块
	[...articles].map(i => i.style.display="block");

	//如果没有关键词，不进行操作
	if(!keywords || keywords.length===0)return;

	texts.forEach((item, index) => {
		const reg = new RegExp(keywords.join("|"));
		if(reg.test(item)){
			//收集需要过滤的信息块序号
			filter.push({index, item});
		}
	});

	//将需要过滤的信息块隐藏
	filter.forEach(i => articles[i.index].style.display="none");

	// console.log(itemCount, filter);
}

setInterval(() => {

	//向 popup 传入初始化 localStorage
	chrome.runtime.sendMessage({
		ls: localStorage.getItem("xq_crx_keywords")
	}, function(response) {
		if(response){
			// console.log('收到来自后台的回复：' + response);
		}
	});

	//如果信息块总数不变，不执行操作
	if(articles.length===itemCount){
		// console.log('没有加载新内容');
		return;
	}
	//否则执行一次过滤
	doFilter();
}, 1000);	