/*
 * @Author: Yiming
 * @Date: 2018-08-27 13:45:35
 * @LastEditors: Yiming
 * @LastEditTime: 2018-08-27 13:45:35
 * @Description: 
 */

console.log('雪球关键词屏蔽器启动！');

//声明各种变量
let itemCount = 0; //前个瞬间信息块个数
const articles = document.getElementsByClassName("timeline__item");//信息块个数
const descrList = document.getElementsByClassName("content--description");//信息块摘要
const detailList = document.getElementsByClassName("content--detail");//信息块全文
const unfoldCtrList = document.getElementsByClassName("timeline__unfold__control");//信息块展开按钮

//监听从 popup 发来的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	// console.log('收到新的关键词列表', request.value);
	if(request.cmd==='init'){//向 popup 传入初始化 localStorage
		if(localStorage.getItem("xq_crx_keywords")){
			chrome.runtime.sendMessage({
				ls: localStorage.getItem("xq_crx_keywords")
			}, function(response) {
				if(response){
					// console.log('收到来自后台的回复：' + response);
				}
			});
		}
	}else if(request.cmd==='keywordsChange'){//将 popup 传来的关键词数组存入本地存储中
		localStorage.setItem("xq_crx_keywords", JSON.stringify(request.value));
		//执行一次过滤操作
		doFilter();	
		//告诉 popup 收到消息
		sendResponse('keywordsChange received!');
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
		const reg = new RegExp(keywords.join("|"));
		if(reg.test(text)){
			//收集需要过滤的信息块序号
			filter.push({index, text});
		}
	});

	//将需要过滤的信息块隐藏
	filter.forEach(i => articles[i.index].style.display="none");

	console.log(`屏蔽关键词：${keywords.join(", ")}`);
	console.log(`一共 ${itemCount} 条，已屏蔽 ${filter.length} 条。已屏蔽内容详情如下：`)
	console.log(filter);	
}

const doUnfold = () => {//定义展开函数
	if(true){//如果设置了自动展开
		[...detailList].forEach(i => {
			i.style.display = 'block';
			const descrList = i.parentNode.getElementsByClassName("content--description");//信息块摘要
			[...descrList].forEach(i => i.style.display = 'none');
		});
		[...unfoldCtrList].forEach(i => {
			i.style.display = 'block';
			i.click();
		});
	}else{//否则
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
	doUnfold();
}, 1000);



//模块屏蔽

//开户链接
document.querySelector('.home__business').style.display = "none";

//今日话题
document.querySelector('.today-topic__container').style.display = "none";

//雪球访谈
document.querySelector('.talks-list__container').style.display = "none";

//热股榜
document.querySelector('.stock-hot__container').style.display = "none";

//最赚钱组合
document.querySelector('.most-profitable__container').style.display = "none";

//雪球私募涨幅榜
document.querySelector('.fund-hot-list__container').style.display = "none";

//用户推荐
document.querySelector('.recommend-user__container').style.display = "none";

//悬赏提问
document.querySelector('.home__reward__entry').style.display = "none";

//其他服务
document.querySelector('.other-service__container').style.display = "none";

//举报专区
document.querySelector('.info-report-wrap').style.display = "none";

//右下角聊天
document.querySelector('.snbim-mainview-wrap').style.display = "none";

//底栏
document.querySelector('.footer').style.visibility = "hidden";//display none 会把返回顶部按钮干掉

//左边栏
document.querySelector('.user__col--lf').style.visibility = "hidden";

//右边栏
document.querySelector('.home__col--rt').style.display = "none";

