# 公開アーカイブの保守

通常のPages更新は、保存済みの成果物とビューアだけで行えます。制作元やCADソフトウェアは不要です。

```sh
npm ci --prefix viewer --no-audit --no-fund
node viewer/scripts/extract-i18n.mjs
python3 tools/localize_pages.py build
npm test --prefix viewer
npm run build --prefix viewer
python3 tools/validate_archive.py
python3 tools/validate_bilingual.py
python3 tools/build_site.py
```

`main` のワークフローは候補データ・ビルド・ハッシュ・ファイル網羅性・リンクを検証してから、
監査対象だけを `_site/` に展開しPagesへ送ります。開発ツール・依存環境・一時ファイルは配信しません。
配信コミットは `archive/deployment.json` で確認できます。
ロールバックは対象の公開変更を通常のrevertコミットとして戻し、同じ検証・配信を通します。force pushは不要です。

## 内容を変更したとき

ファイル目録は実ファイルから生成します。意図しない差異を見逃すために、検証前に無条件で再生成しないでください。
変更範囲を確認してから、開発依存を用意して目録を更新します。

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt
.venv/bin/python tools/finalize_archive.py inventory
.venv/bin/python tools/validate_archive.py --full
```

ZIPの中身を変更するときは新しい版・Releaseを使用し、既存のタグ・ZIPを上書きしないでください。
`finalize_archive.py` の版を更新したうえで `bundles` → `inventory` と実行します。
署名のない「当時のPASS」を、現在の実物合格や製造リリースへ変えないでください。

## ブラウザー

`build_site.py` の後、`serve_preview.py` はループバックだけにbindし、
実際のプロジェクトサブパスとMP4のRangeレスポンスを再現します。
`browser_check.py` は新しい独立コンテキストで、画像9種、選定3種の実WebGLと各操作、
動画、ダウンロード、モバイル、欠損時の表示を確認します。既存のChromium実行ファイルを
`--browser` で指定してください。普段のブラウザープロファイルには接続せず、ブラウザーを自動インストールしません。

## 初回移植の記録用ツール

`import_archive.py` は列挙した成果物しか読みません。`inventory` を先に実行し、変更のない入力だけをコピーします。
`portable_blender.py` は公開コピーに対するネイティブメタデータ整理であり、形状の生成・レンダーではありません。
`verify_native.py` は展開済みFreeCADを再計算・保存せず開くだけです。
`make_portability.py` は形状ストリーム・配置・ピクセルの比較結果をパス情報なしの公開記録へまとめます。
これらは初回移植で使用した手順で、通常のサイト配信からは実行しません。

## 日英ページの保守

`site/templates/` が8ページの共通HTML、`site/routes.json` が既存URLと `/ja/`・`/en/` の対応です。
ルートの既存日本語ページを含む24個の薄いHTMLを生成し、画像・動画・CAD・モデルJSONは共有します。
生成されたHTMLや `assets/translations.js` を直接編集せず、テンプレートと `site/i18n/*.en.json` を更新してください。

日本語の原文をメッセージIDとするカタログです。動的テキストはASTから抽出し、`{0}` 等の変数を
英訳でも維持します。HTMLはパーサーで組み立て、実行時は表示テキストと説明属性だけを更新します。
`innerHTML`、外部翻訳API、ブラウザー言語による自動リダイレクトは使用しません。
文字列が欠落した英語表示は明示エラーになり、ビルドとブラウザー検査でも検出します。

モデルのID・数値・列挙値・JSON・CSVは翻訳しません。ファイル一覧のパスと取得先も対応を固定します。
言語切替は同じDOM/3Dキャンバス上で行い、部品選択・進行・検索・BOM・視点を維持します。
ビューアの共有URLにも状態を持たせ、新しいタブや再読み込み時は型・範囲・IDを検証して復元します。
言語はURLとHTMLで明示し、localStorageやブラウザーの既定言語に依存しません。

言語変更だけの作業で `prepare` や `bundles` を再実行しないでください。
`site/immutable-artifacts.json` は既存の制作物・媒体・Releaseメタデータを固定し、
`validate_bilingual.py` がハッシュの不変と共有アセットの利用を検証します。
`browser_bilingual.py` は日英の本文・aria・エラー、3体の実WebGL、切替前後の状態、
深い共有URL・再読み込み、390px表示、既存URL互換を確認します。

## 版を切り替えるとき

`archive/revisions.json` が現行版、世代、公開可否、カタログSHA-256、版別の実物状態を分離します。
`INPUT_WAIT` にカタログやZIPの取得リンクを付けたり、現行版に指定することはできません。
新しい版は制作担当の固定commit・実出力・公開allowlistがそろった後にだけ取り込みます。
旧 `artifacts/selected/current.json` と `archive/status.json` はr2当時の固定記録として残し、更新しません。

旧候補IDを含む共有URLはr2/Phase1に固定して解釈し、新型へ黙って置き換えません。
不明な版・candidate・モードやカタログハッシュ不一致は明示エラーです。
`browser_revision.py --expect-input-wait` は制作データ未受領時の画面と旧版の実WebGLを検証します。
READY後は新型の実データ検査を追加してから、フラグなしの受入検証と公開を行います。
作り物のモデル・画像や、旧版を付け替えた新revisionは公開しません。
