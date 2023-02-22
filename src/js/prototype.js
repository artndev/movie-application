let listeners = [];


EventTarget.prototype.addEventListenerNew = function (type, listener) {
    listeners.push({target: this, type: type, listener: listener});
    this.addEventListener(type, listener);
};

EventTarget.prototype.removeAllEventListeners = function () {
    listeners.forEach((el, i) => {
        if(el.target === this) {
            this.removeEventListener(el.type, el.listener)
            delete listeners[i]
        }
    })
};
