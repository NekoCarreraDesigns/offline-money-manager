let db;

const dbRequest = indexedDB.open("offline-money-manager", 1);

dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectSore("pending", { autoIncrement: true });
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    if (navigator.online) {
        checkDatabase();
    }
};

dbRequest.onerror = (event) => {
    console.log("Dang it!" + event.target.errorCode);
};

saveRecord = (record) => {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(record);
};

checkDatabase = () => {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then((response) => response.json())
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite")
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };

};

window.addEventListener("online", checkDatabase);