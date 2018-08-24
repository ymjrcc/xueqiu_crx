// chrome.storage.sync.get(null, function(items) {
//     if(item.keywords && item.keywords.length>0){
//         const list = items.keywords.map(i => `<li>${i}</li>`);
//         // const list = ['期货', '现货', '日经'].map(i => `<li>${i}</li>`);
//         document.getElementById("ul").innerHTML = list;
//     }
// });

const list = ['期货', '现货', '日经'].map(i => `<li>${i}</li>`).join("");
document.getElementById("ul").innerHTML = list;


// chrome.storage.sync.set({keywords: ['期货', '现货', '日经']}, function() {
// 	console.log('保存成功！');
// });