let interval;
console.log('雪球屏蔽器启动！');
window.onscroll = function(){
	clearInterval(interval);
	interval = setTimeout(() => {
	    const articles = document.getElementsByClassName("timeline__item");
	    const contents = [...articles].map(node => node.getElementsByClassName("content--description")[0]);
	    const texts = contents.map(node => node.querySelector("div")).map(node => node.textContent);
	    const filter = [];
	    texts.forEach((item, index) => {
	        const words = ['期货'];
	        const reg = new RegExp(words.join("|"));
	        if(reg.test(item)){
				filter.push({index, item});
	        }
		});
		console.log(filter);
	    filter.forEach(i => articles[i.index].style.display="none");
	}, 500);	
}