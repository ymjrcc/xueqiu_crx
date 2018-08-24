console.log('雪球屏蔽器启动！');

//监听从 popup 发来的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.cmd == 'send'){
		console.log(request.value);
		//将 popup 传来的消息存入本地存储中
		localStorage.setItem("xq_crx_keywords", JSON.stringify(request.value));
		//执行一次过滤操作
		doFilter();	
	}
	console.log('收到新的关键词列表', request.value);
	//告诉 popup 收到消息
	sendResponse('我收到了你的消息！');
});


let itemCount = 0;
const articles = document.getElementsByClassName("timeline__item");//信息块个数

const doFilter = () => {//执行过滤函数

	itemCount = articles.length;
	const contents = document.getElementsByClassName("content--description");
	const texts = [...contents].map(node => node.querySelector("div")).map(node => node.textContent);//文本列表
	
	const filter = [];
	const keywords = JSON.parse(localStorage.getItem("xq_crx_keywords"));
	console.log(keywords);

	texts.forEach((item, index) => {
		const reg = new RegExp(keywords.join("|"));
		if(reg.test(item)){
			//收集需要过滤的信息块序号
			filter.push({index, item});
		}
	});

	//将需要过滤的信息块隐藏
	filter.forEach(i => articles[i.index].style.display="none");

	console.log(itemCount, filter);
}

setInterval(() => {
	//如果信息块总数不变，不执行操作
	if(articles.length===itemCount){
		console.log('没有加载新内容');
		return;
	}
	//否则执行一次过滤
	doFilter();
}, 500);	