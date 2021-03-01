const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric' });

function init() {
    makeXhrRequest("GET", "isLoggedIn", (response) => {
        if (response.isLoggedIn) {
            const loginControls = document.getElementById("login-controls");
            loginControls.className = "hidden";
            const artistInfo = document.getElementById("artist-info");
            artistInfo.className = "";
        }
    });
}

function login() {
    makeXhrRequest("GET", "albums", (response) => {
        console.log(response);
    });
}

function authNoLogin() {
    makeXhrRequest("GET", "authNoLogin", (response) => {
        console.log(response);
    });
}

function searchArtists() {
    const artistSearch = document.getElementById("artist-search");
    makeXhrRequest("GET", "artistSearch?q=" + artistSearch.value, (response) => {
        console.log(response);
    });
}

function addItem(items) {
    const list = document.getElementById("item-list");

    for (let item of items) {
        const li = document.createElement("li");
        li.innerText = item.author + ":   " + item.en;
        list.appendChild(li);
    }
}

function getAlbums() {
    const xhr = new XMLHttpRequest();
    const spotifyUrl = "https://api.spotify.com/v1/artists/1vCWHaC5f2uS3yhpwWbIA6/albums?album_type=SINGLE&offset=20&limit=10";
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var items = JSON.parse(this.responseText);
            addItem(items);
        }
    };
    xhr.open("GET", spotifyUrl, true);
    xhr.send();
}

function makeXhrRequest(method, url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const response = JSON.parse(this.responseText);
            callback(response);
        }
    };
    xhr.open(method, url, true);
    xhr.send();
}
