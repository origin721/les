export function on_init_indexdb() {
  let openRequest = indexedDB.open("store", 1);

  openRequest.onupgradeneeded = function(event) {
    // версия существующей базы данных меньше 2 (или база данных не существует)
    let db = openRequest.result;
    switch(event.oldVersion) { // существующая (старая) версия базы данных
      case 0:
        // версия 0 означает, что на клиенте нет базы данных
        // выполнить инициализацию
        if (!db.objectStoreNames.contains('books')) { // если хранилище "books" не существует
          db.createObjectStore('books', {keyPath: 'id'}); // создаём хранилище
        }
        break;
      case 1:
        // на клиенте версия базы данных 1
        // обновить
        break;
    }
  };

  openRequest.onerror = function () {
    console.error("Error", openRequest.error);
  };

  openRequest.onsuccess = function () {
    let db = openRequest.result;

    db.onversionchange = function() {
      db.close();
      console.log("База данных устарела, пожалуйста, перезагрузите страницу.")
    };

    // продолжить работу с базой данных, используя объект db
  };

  openRequest.onblocked = function() {
    // это событие не должно срабатывать, если мы правильно обрабатываем onversionchange
  
    // это означает, что есть ещё одно открытое соединение с той же базой данных
    // и он не был закрыт после того, как для него сработал db.onversionchange
    console.log('Событие не должно было сработать');
  };
}