document.addEventListener("DOMContentLoaded", start);


class NiCommentManager {
    constructor(options) {
        this._ops = options;
        this._$elm = document.createElement("ul");
        this._$elm.className = "wrap";

        this._$dummyLine = document.createElement("li");
        this._$dummyLine.className = "line dummy";

        this.$elm.appendChild(this.$dummyLine);

        this._lines = [];
        this._comments = [];

        this._loadManager = new LoadManager(options.path, options.loadInterval);
        this._loadManager.on("comment", this.addComment.bind(this));

        this.init();
    }
    get $elm() {
        return this._$elm;
    }

    get $dummyLine() {
        return this._$dummyLine;
    }

    onPassed(comment) {
        const i = this._comments.indexOf(comment);
        this._comments.splice(i, 1);
    }

    init() {

        const $elm = this._$elm;
        const ops = this._ops;

        let lineHeight = ops.lineHeight || 1.4;
        lineHeight = Math.min(3, Math.max(1.0, lineHeight));

        let lineNum = ops.lineNum || 10;
        lineNum = Math.min(30, Math.max(1, lineNum));

        let duration = ops.duration || 5000;
        duration = Math.min(10*1000, Math.max(500, duration));

        let color = ops.color;
        let fontWeight = ops.fontWeight;
        let fontFamily = ops.fontFamily;
        let textShadow = ops.textShadow;
        let lengthLimit = ops.lengthLimit;
        let opacity = ops.opacity;

        $elm.style.setProperty("--cLineHeight", ops.lineHeight);
        $elm.style.setProperty("--cDuration", duration + "ms");
        $elm.style.setProperty("--cColor", color);
        $elm.style.setProperty("--cFontSize", 100/(lineHeight*lineNum) + "vh" );
        $elm.style.setProperty("--cFontWeight", fontWeight);
        $elm.style.setProperty("--cFontFamily", fontFamily);
        $elm.style.setProperty("--cTextShadow", textShadow);
        $elm.style.setProperty("--cLengthLimit", lengthLimit * 1.05 + "em");
        $elm.style.setProperty("opacity", opacity);

        for (let i=0; i < lineNum; i++) {
            const line = new DisplayLine();
            this._lines.push(line);
            line.on("passed", this.onPassed.bind(this));
            this.$elm.appendChild(line.$elm);
        }
        this._loadManager.start();
    }

    addComment(commentData) {
        const comment = new Comment(commentData, this._ops.format);
        this._comments.push(comment);

        let cWidth = this.getCommentWidth(comment);
        let targetLineNum = 0;
        let minCollisionTime = 999999;
        let minCongestionVal = 999999;

        for (let i=0; i < this._lines.length; i++) {
            const line = this._lines[i];
            const cTime = Math.max(0, line.calcCollisionTime(cWidth));
            const cVal = line.congestionValue();
            // 衝突時間と開幕の衝突量が両方0ならその行を使う
            if (cTime == 0 && cVal == 0) {
                targetLineNum = i;
                break;
            }
            // 衝突時間が短くてなおかつ開幕の衝突量も少なければその行を使う
            if (cTime < minCollisionTime && cVal <= minCongestionVal) {
                targetLineNum = i;
                minCollisionTime = cTime;
                minCongestionVal = cVal;
            }
        }

        this._lines[targetLineNum].addComment(comment);
    }

    getCommentWidth(comment) {
        const $comment = comment.$elm.cloneNode(true);
        this.$dummyLine.appendChild($comment);
        const cWidth = $comment.clientWidth;
        $comment.remove();
        return cWidth;
    }
}

const cManager = new NiCommentManager(OPTIONS);
function start() {
    document.body.appendChild(cManager.$elm);
}