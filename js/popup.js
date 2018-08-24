const keywords = localStorage.getItem("keywords")?JSON.parse(localStorage.getItem("keywords")):[];
console.log(keywords);
if(keywords.length>0 && keywords[0]!==""){
    const list = keywords.map(i => `<li>${i}</li>`).join("");
    document.getElementById("ul").innerHTML = list;
}

const addBtn = document.getElementById("add");
const input = document.getElementById("input");

function sendMessageToContentScript(message, callback){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, message, function(response){
			if(callback) callback(response);
		});
	});
}

addBtn.addEventListener("click", function(){

    const newWord = input.value;
    if(newWord && keywords.findIndex(item => item === newWord) === -1){//有值且不和已有的重复

        const keywords = localStorage.getItem("keywords")?JSON.parse(localStorage.getItem("keywords")):[];
        const newKeywords = [...keywords, newWord];
        localStorage.setItem("keywords", JSON.stringify(newKeywords));
        const list = newKeywords.map(i => `<li>${i}</li>`).join("");
        document.getElementById("ul").innerHTML = list;
        input.value = "";

        sendMessageToContentScript({cmd:'send', value: newKeywords}, function(response){
            console.log('来自content的回复：'+response);
        });     

    }
});

console.log(localStorage)
