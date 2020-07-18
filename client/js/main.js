const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric' });

function getData() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var items = JSON.parse(this.responseText);
            addItem(items);
        }
    };
    xhr.open("GET", "items", true);
    xhr.send();
}

function addItem(items) {
    const list = document.getElementById("item-list");

    for (let item of items) {
        const li = document.createElement("li");
        li.innerText = item.author + ":   " + item.en;
        list.appendChild(li);
    }
}
