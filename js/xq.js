console.log('雪球屏蔽器启动！');

// chrome.storage.sync.get(null, function(items) {
// 	console.log(items.keywords);
// });

let itemCount = 0;
const articles = document.getElementsByClassName("timeline__item");

setInterval(() => {
	if(articles.length===itemCount){
		console.log('没有加载新内容');
		return;
	}
	itemCount = articles.length;

	const contents = document.getElementsByClassName("content--description");
	const texts = [...contents].map(node => node.querySelector("div")).map(node => node.textContent);
	
	const filter = [];
	texts.forEach((item, index) => {
		// chrome.storage.sync.get(null, function(items) {
		// 	if(item.keywords && item.keywords.length>0){
		// 		const words = items.keywords;
		// 		const reg = new RegExp(words.join("|"));
		// 		if(reg.test(item)){
		// 			filter.push({index, item});
		// 		}
		// 	}
		// });
		const words = ['期货', '现货', '日经'];
		const reg = new RegExp(words.join("|"));
		if(reg.test(item)){
			filter.push({index, item});
		}
	});

	filter.forEach(i => articles[i.index].style.display="none");

	console.log(itemCount, filter);

}, 1000);	