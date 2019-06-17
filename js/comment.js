let CommentData, Comment, DisplayLine;

CommentData = class CommentData {
    constructor(text, name, time, service) {
        this._text = text;
        this._name = name;
        this._time = time;
        this._service = service;
    }
    get text() {
        return this._text;
    }
    get name() {
        return this._name;
    }
    get time() {
        return this._time;
    }
    get service() {
        return this._service;
    }

    isSame(commentData) {
        return (
            commentData.text == this.text
            && commentData.name == this.name
            && commentData.time == this.time
            && commentData.service == this._service
        )
    }
}

Comment = class Comment {
    constructor(commentData, format) {
        this._$elm = document.createElement("p");
        this._$elm.className = "comment";

        this._commentData = commentData;
        this._format = format;
        this.text = this.generateFormattedComment(this.data, this.format);
    }
    get $elm() {
        return this._$elm;
    }
    get data() {
        return this._commentData;
    }
    get format() {
        return this._format;
    }
    set format(format) {
        this._format = format;
        this.text = this.generateFormattedComment(this.data, this.format);
    }
    get text() {
        return this._text;
    }
    set text(text) {
        this._text = text;
        this.$elm.innerText = text;
    }

    generateFormattedComment(commentData, format) {
        let res = format;
        res = res.replace(/\$NAME\$/g, commentData.name);
        res = res.replace(/\$COMMENT\$/g, commentData.text);
        return res;
    }
}

DisplayLine = class DisplayLine {
    constructor() {
        this._$elm = document.createElement("li");
        this._$elm.className = "line";

        this._comments = [];

        this._listeners = {
            passed: []
        };
    }
    get $elm() {
        return this._$elm;
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

    // 混雑状況(流れ切っていない長さが返される。0が最低)
    congestionValue() {
        let val = 0;
        let width = this.$elm.clientWidth;
        this._comments.forEach(comment => {
            let cLeft = comment.$elm.offsetLeft;
            let cWidth = comment.$elm.clientWidth;
            let _val = cLeft + cWidth - width;
            if (_val > val) {
                val = _val;
            }
        });
        return Math.max(val, 0);
    }

    // 渡された横幅のコメントが追加された場合の衝突する時間を返す(値が小さいほど衝突しない)
    calcCollisionTime(cWidth) {
        let wrapWidth = this.$elm.clientWidth;
        let cLeftArrivalTime = wrapWidth / (cWidth + wrapWidth);
        let collisionTime = (1 - this.minProgress()) - cLeftArrivalTime;
        return collisionTime;
    }

    // 一番進んでいないコメントの進み具合が0-1で返される
    minProgress() {
        let minProgress = 1;
        let wrapWidth = this.$elm.clientWidth;
        this._comments.forEach(comment => {
            let cLeft = comment.$elm.offsetLeft;
            let cWidth = comment.$elm.clientWidth;
            let progress = 1 - (cWidth + cLeft) / (cWidth + wrapWidth);
            if (minProgress > progress) {
                minProgress = progress;
            }
        });
        return minProgress;
    }

    addComment(comment) {
        if (this._comments.indexOf(comment) >= 0) return false;
        this._comments.push(comment);
        this.$elm.appendChild(comment.$elm);

        comment.$elm.addEventListener("animationend", () => {
            const i = this._comments.indexOf(comment);
            this._comments.splice(i, 1);
            comment.$elm.remove();
            this.emit("passed", comment);
        });
    }
}

