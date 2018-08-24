console.log('雪球屏蔽器启动！');

// chrome.storage.sync.get(null, function(items) {
// 	console.log(items.keywords);
// });

let itemCount = 0;

setInterval(() => {
	const articles = document.getElementsByClassName("timeline__item");
	const contents = [...articles].map(node => node.getElementsByClassName("content--description")[0]);
	const texts = contents.map(node => node.querySelector("div")).map(node => node.textContent);
	const filter = [];
	if(texts.length===itemCount){
		console.log('没有加载新内容');
		return;
	}
	itemCount = texts.length;
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
	console.log(itemCount, filter);
	filter.forEach(i => articles[i.index].style.display="none");
}, 1000);	