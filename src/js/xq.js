
console.log('雪球关键词屏蔽器启动！');
console.log(`屏蔽关键词：${localStorage.getItem("xq_crx_keywords")}`);

//声明各种变量
let itemCount = 0; //前个瞬间信息块个数
const articles = document.getElementsByClassName("timeline__item");//信息块个数
const detailList = document.getElementsByClassName("content--detail");//信息块全文
const unfoldCtrList = document.getElementsByClassName("timeline__unfold__control");//信息块展开按钮

const moduleData = [
	{cmd: "business", ls: "xq_crx_business", className: "home__business"},
	{cmd: "today_topic", ls: "xq_crx_today_topic", className: "today-topic__container"},
	{cmd: "talks_list", ls: "xq_crx_talks_list", className: "talks-list__container"},
	{cmd: "stock_hot", ls: "xq_crx_stock_hot", className: "stock-hot__container"},
	{cmd: "most_profitable", ls: "xq_crx_most_profitable", className: "most-profitable__container"},
	{cmd: "fund_hot_list", ls: "xq_crx_fund_hot_list", className: "fund-hot-list__container"},
	{cmd: "recommend_user", ls: "xq_crx_recommend_user", className: "recommend-user__container"},
	{cmd: "reward", ls: "xq_crx_reward", className: "home__reward__entry"},
	{cmd: "other_service", ls: "xq_crx_other_service", className: "other-service__container"},
	{cmd: "info_report", ls: "xq_crx_info_report", className: "info-report-wrap"},
	{cmd: "snbim_mainview", ls: "xq_crx_snbim_mainview", className: "snbim-mainview-wrap"},
	// {cmd: "footer", ls: "xq_crx_footer", className: "footer"},
	// {cmd: "left", ls: "xq_crx_left", className: "user__col--lf"},
	{cmd: "right", ls: "xq_crx_right", className: "home__col--rt"},
];

//监听从 popup 发来的消息，根据消息类型，执行不同的操作
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.cmd==='init'){//点开 popup，会向 content-script 发送一个 init 信息
		//给 popup 发送信息
		chrome.runtime.sendMessage({//向 popup 传入初始化 localStorage

			keywords: localStorage.getItem("xq_crx_keywords")?JSON.parse(localStorage.getItem("xq_crx_keywords")):[],//关键词

			business: localStorage.getItem("xq_crx_business"),//开户信息
			today_topic: localStorage.getItem("xq_crx_today_topic"),//今日话题
			talks_list: localStorage.getItem("xq_crx_talks_list"),//雪球访谈
			stock_hot: localStorage.getItem("xq_crx_stock_hot"),//热股榜
			most_profitable: localStorage.getItem("xq_crx_most_profitable"),//最赚钱组合
			fund_hot_list: localStorage.getItem("xq_crx_fund_hot_list"),//雪球私募涨幅榜
			recommend_user: localStorage.getItem("xq_crx_recommend_user"),//用户推荐
			reward: localStorage.getItem("xq_crx_reward"),//悬赏提问
			other_service: localStorage.getItem("xq_crx_other_service"),//其他服务
			info_report: localStorage.getItem("xq_crx_info_report"),//举报专区
			snbim_mainview: localStorage.getItem("xq_crx_snbim_mainview"),//右下角聊天
			// footer: localStorage.getItem("xq_crx_footer"),//底栏
			// left: localStorage.getItem("xq_crx_left"),//左边栏
			right: localStorage.getItem("xq_crx_right"),//右边栏

			unfold: localStorage.getItem("xq_crx_unfold"),//是否展开全文

		}, function(response) {
			if(response){
				console.log('收到来自 popup 的回复：' + response);
			}
		});
		sendResponse('init code received!');
	}else if(request.cmd==='keywordsChange'){//关键词列表更新后，将 popup 传来的 关键词数组 存入本地存储中
		localStorage.setItem("xq_crx_keywords", JSON.stringify(request.value));
		//执行一次过滤操作
		doFilter();	
		//告诉 popup 收到消息
		sendResponse('keywordsChange received!');
	}else if(request.type==='module'){//模块配置信息更新后，将 popup 传来的 模块配置信息 存入本地存储中
		const showOrHide = (ls, className) => {
			localStorage.setItem(ls, request.value);
			document.querySelector(`.${className}`).style.display = (request.value==="hide")?"none":"block";
		}
		const m = moduleData.find(item => request.cmd===item.cmd);

		m && showOrHide(m.ls, m.className);
	}else if(request.cmd==="unfold"){
		const flag = request.value;
		localStorage.setItem("xq_crx_unfold", flag);
		doUnfold(flag);
	}
});


const doFilter = () => {//定义过滤函数

	itemCount = articles.length;

	const texts = [...articles].map(article => {//每条信息块的文本格式
		let text;
		const content_detail = article.querySelectorAll(".content--detail div");
		if(content_detail.length>0){//如果有详情，取详情文字
			text = [...content_detail].map(div => div.textContent).join(" ");
		}else{//如果没有，取摘要文字
			const content_description = article.querySelectorAll(".content--description div");
			text = [...content_description].map(div => div.textContent).join(" ");
		}
		return text;
	});
	
	const filter = [];
	const keywords = JSON.parse(localStorage.getItem("xq_crx_keywords"));

	//初始化消息块
	[...articles].map(i => i.style.display="block");

	//如果没有关键词，不进行操作
	if(!keywords || keywords.length===0)return;

	texts.forEach((text, index) => {
		const reg = new RegExp(keywords.join("|"),"g");
		const matches = text.match(reg);
		if(Array.isArray(matches) && matches.length>0){
			const set = new Set(matches);//过滤重复项
			const keywords = [...set].join();
			//收集需要过滤的信息块序号
			filter.push({index, keywords, text});
		}
	});

	//将需要过滤的信息块隐藏
	filter.forEach(i => articles[i.index].style.display="none");

	console.log(`一共 ${itemCount} 条，已屏蔽 ${filter.length} 条。已屏蔽内容详情如下：`)
	console.log(filter);	
}

const doUnfold = (flag) => {//定义展开函数
	if(flag==="unfold"){//如果设置了自动展开，全部展开
		[...detailList].forEach(i => {
			i.style.display = 'block';
			const descrList = i.parentNode.getElementsByClassName("content--description");//信息块摘要
			[...descrList].forEach(i => i.style.display = 'none');
		});
		[...unfoldCtrList].forEach(i => {
			i.style.display = 'block';
			i.click();
		});
	}else{//否则，全部折叠
		[...detailList].forEach(i => {
			i.style.display = 'none';
			const descrList = i.parentNode.getElementsByClassName("content--description");//信息块摘要
			[...descrList].forEach(i => i.style.display = 'block');
		});
	}
}

setInterval(() => {
	//如果信息块总数不变，不执行操作
	if(articles.length===itemCount){
		return;
	}
	//否则执行一次过滤和展开判断
	doFilter();
	doUnfold(localStorage.getItem("xq_crx_unfold"));
}, 1000);



//模块屏蔽
moduleData.forEach(item => {
	const hide = localStorage.getItem(item.ls)==="hide";
	// if(item.cmd!=="footer" && item.cmd!=="left"){
		document.querySelector(`.${item.className}`).style.display = hide?"none":"block";
	// }else{
		// document.querySelector(`.${item.className}`).style.visibility = hide?"hidden":"visible";
	// }
});

//热股榜
// document.querySelector('.stock-hot__container').style.display = "none";

// //最赚钱组合
// document.querySelector('.most-profitable__container').style.display = "none";

// //雪球私募涨幅榜
// document.querySelector('.fund-hot-list__container').style.display = "none";

// //用户推荐
// document.querySelector('.recommend-user__container').style.display = "none";

// //悬赏提问
// document.querySelector('.home__reward__entry').style.display = "none";

// //其他服务
// document.querySelector('.other-service__container').style.display = "none";

// //举报专区
// document.querySelector('.info-report-wrap').style.display = "none";

// //右下角聊天
// document.querySelector('.snbim-mainview-wrap').style.display = "none";

// //底栏
// document.querySelector('.footer').style.visibility = "hidden";//display none 会把返回顶部按钮干掉

//左边栏
// document.querySelector('.user__col--lf').style.visibility = "hidden";

//右边栏
// document.querySelector('.home__col--rt').style.display = "none";

