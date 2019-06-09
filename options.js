const OPTIONS = {
    // コメントの行数
    lineNum: 10,

    // コメントの1行の高さ
    // (1.0が1文字分の高さ)
    // (1.0より大きくすることで行間を開けることができます)
    lineHeight: 1.4,

    // コメントの流れる時間(ミリ秒)
    duration: 5000,

    // コメントの色設定
    // (CSSのcolor書式)
    color: "#fff",

    // コメントの太さ設定
    // (CSSのfont-weight書式)
    fontWeight: "bold",

    // コメントのフォント
    // (CSSのfont-family書式)
    fontFamily: `"Helvetica Neue", "メイリオ", Meiryo, Helvetica, Arial, sans-serif`,

    // コメントのドロップシャドウ
    // (CSSのtext-shadow書式)
    textShadow: `
        0 0 0.1em #000,
        0 0 0.1em #000,
        0 0 0.1em #000,
        0 0 0.1em #000,
        0 0 0.1em #000,
        0 0 0.1em #000,
        0 0 0.1em #000,
        0 0 0.1em #000,
        0 0 0.1em #000
    `,

    // 透明度
    // (0.0-1.0で指定します。0.0に近いほど透明になります)
    // (CSSのopacity書式)
    opacity: 0.8,

    // 表示する文字数制限
    // (超えた場合「…」で省略されます)
    lengthLimit: 30,

    // 表示形式指定
    // ($NAME$が名前、$COMMENT$がコメントに置き換えられます)
    format: "$COMMENT$",

    // コメジェネのcomment.xmlへのパス
    // 相対パスで指定してください
    path: "../comment.xml",

    // comment.xmlの読み込み間隔(ミリ秒)
    loadInterval: 500
}