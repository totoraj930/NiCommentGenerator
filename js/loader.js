class LoadManager {
    constructor(path="../comment.xml", loadInterval=500) {
        this._path = path;
        this._loadInterval = Math.min(3*1000, Math.max(500, loadInterval));

        this._$prevXML = null;

        this._prevLoadTime = null;

        this._timer = null;

        this._emitTimers = {};

        this._listeners = {
            comment: []
        };
    }

    start() {
        this._loadComments(true);
    }

    stop() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
        const keys = Object.keys(this._emitTimers);
        keys.forEach(key => {
            clearTimeout(this._emitTimers[key]);
            delete this._emitTimers[key];
        });
    }

    async _loadComments(isFirst) {
        try {
            const xml = await this._getXML(this._path);
            if (!xml) {
                this._timer = setTimeout(
                    this._loadComments.bind(this, isFirst),
                    this._loadInterval
                );
                return;
            }
            if (!isFirst) {
                const commentDatas = this._getNewCommentDatas(xml);
                this._reserveEmitComments(commentDatas);
            }
            // 前回の読み込み時間を更新
            this._prevLoadTime = Date.now();
            this._$prevXML = xml;
        } catch(error) {
            // alert(error);
        }
        this._timer = setTimeout(
            this._loadComments.bind(this),
            this._loadInterval
        );
    }

    _reserveEmitComments(commentDatas) {
        commentDatas.forEach(commentData => this._reserveEmitComment(commentData));
    }

    _reserveEmitComment(commentData) {
        const id = this.generateUuid();
        this._emitTimers[id] = setTimeout(
            () => {
                this.emit("comment", commentData);
                delete this._emitTimers[id];
            }
            ,
            Math.max(
                0,
                Math.min(
                    commentData.time - this._prevLoadTime,
                    this._loadInterval
                )
            )
        );
    }

    _getNewCommentDatas(xml) {
        const $prevLast = this._$prevXML.querySelector("log").lastElementChild;
        const $comments = xml.querySelectorAll("comment");
        let nextIndex = 0;
        for (let i=0; i < $comments.length; i++) {
            const $comment = $comments[i];
            if (
                $comment.innerHTML == $prevLast.innerHTML &&
                $comment.getAttribute("handle") == $prevLast.getAttribute("handle") &&
                $comment.getAttribute("time") == $prevLast.getAttribute("time") &&
                $comment.getAttribute("service") == $prevLast.getAttribute("service")
            ) {
                nextIndex = i+1;
                break;
            }
        }
        
        const $newComments = [].slice.call($comments, nextIndex);

        const newCommentDatas = $newComments.map($comment => {
            return new CommentData(
                $comment.innerHTML,
                $comment.getAttribute("handle"),
                $comment.getAttribute("time")　* 1000,
                $comment.getAttribute("service")
            );
        });

        return newCommentDatas;
    }

    _getXML(path) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", path);
            xhr.send();
            xhr.onloadend = event => {
                resolve(xhr.responseXML);
            };
            xhr.onerror = event => {
                reject(event);
            };
        });
    }

    // https://qiita.com/psn/items/d7ac5bdb5b5633bae165
    generateUuid() {
        // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
        // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
        for (let i = 0, len = chars.length; i < len; i++) {
            switch (chars[i]) {
                case "x":
                    chars[i] = Math.floor(Math.random() * 16).toString(16);
                    break;
                case "y":
                    chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                    break;
            }
        }
        return chars.join("");
    }

    on(eventName, cb) {
        if (!this._listeners.hasOwnProperty(eventName)) {
            this._listeners[eventName] = [cb];
        } else {
            this._listeners[eventName].push(cb);
        }
    }
    off(eventName, cb) {
        if (!this._listeners[eventName]) return false;
        if (cb) {
            const i = this._listeners[eventName].indexOf(cb);
            if (i < 0) return false;
            this._listeners[eventName].splice(i, 1);
        } else {
            delete this._listeners[eventName];
        }
        return true;
    }
    emit(eventName, ...args) {
        if (!this._listeners[eventName]) return false;
        this._listeners[eventName].forEach(cb => cb(...args));
    }


}