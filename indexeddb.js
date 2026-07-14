let db;

const request = window.indexedDB.open("MusicDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore("songs", 
        {
            keyPath: "id", 
            autoIncrement: true
        }
    );
    console.log("Succesfully Creating Table");
}

function storeMusic(songObject) {
    const transaction = db.transaction(["songs"], "readwrite");
    const store = transaction.objectStore("songs");

    const requestAdd = store.add(songObject);

    requestAdd.onsuccess = function() {
        console.log("Song added");
    }

    requestAdd.onerror = function(event) {
        console.error("An error occured", event.target.error);
    }
}

  function getAllSongs(callback) {
    const transaction = db.transaction(["songs"], "readonly");
    const store = transaction.objectStore("songs");

    const requestGetAll = store.getAll();
    requestGetAll.onsuccess = function() {
        callback(requestGetAll.result);
    }

    requestGetAll.onerror = function(event) {
        console.error("error fetching data", event.target.error);
    }
  }

request.onerror = function(event) {
    console.error("Failed to open Database", event.target.error);
}

request.onsuccess = function(event) {
    db = event.target.result
    console.log("Database MusicDB opened")
}