let _listeners = [];


EventTarget.prototype.addEventListenerNew = function (type, listener) {
    _listeners.push({target: this, type: type, listener: listener});
    this.addEventListener(type, listener);
};

EventTarget.prototype.removeAllEventListeners = function () {
    _listeners.forEach((el, i) => {
        if(el["target"] === this) {
            this.removeEventListener(el["type"], el["listener"])
            delete _listeners[i]
        }
    })
};
