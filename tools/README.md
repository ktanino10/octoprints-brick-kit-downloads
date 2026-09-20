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

`site/templates/` が10ページの共通HTML、`site/routes.json` が既存URLと `/ja/`・`/en/` の対応です。
ルートの既存日本語ページを含む30個の薄いHTMLを生成し、画像・動画・CAD・モデルJSONは共有します。
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

`revision_import.py` はREADY receiptと固定source commit、明示ファイルごとのSHA-256を検証し、
新版だけを `.archive-work/import-<revision>/` へコピーします。ソースも公開済み旧版も変更しません。
JSONは付随情報だけ、PNGはメタデータchunkだけ、FreeCADは文書プロパティだけを整理し、
形状ストリームと同じallowlist内の相対参照を検証します。新しい版を自動でcurrentにする機能はありません。

`portable_blender.py` は `--revision`・`--stage-root`・`--report` をBlenderの `--` より後に要求します。
編集先は所有する一時stagingだけです。メッシュ・配置・マテリアル指紋と保存後SHAを確認します。
`verify_native.py` もstagingへ全展開したパッケージのみを、保存・再計算せず開きます。
これらの報告が全ネイティブファイルの実バイトに一致して初めて、`package_revision.py` が新規ZIPと
版別の出典/portable記録を作れます。既存revision・ZIP・成果物の上書きは拒否します。

`check_revision.mjs` はschema3の実マニフェスト・実共有メッシュ集合・各画像/動画/ガイドの
実在を照合します。型数はコードに固定せず、3体が実際に使う型の和集合から確かめます。
part IDs、3.2 mm単位の底面Z、brick/plateの可変高さ、公称の接触グラフを検証し、
旧micro-pin形状・別版・物理合格の偽装を受け付けません。これは物理製造の認定ではありません。

`verify_publication.py` は実Pages配信のpublic commitとcurrent revisionを確認し、
指定した前回公開commitから変化したファイルだけを匿名GETしてSHA-256を照合します。
新しいRelease ZIP、日英各route、MP4の206 Rangeも確認し、旧大型履歴を全件再ダウンロードしません。
`--expected-commit` はpublic側の配信commit、`--before` は今回の反映前のpublic mainです。
制作担当のprivate source commitと取り違えないでください。これは認証不要な公開結果の検査であり、
ネットワークへソースや資格情報を送る処理ではありません。

## 形状と部品数の比較

`shape-options.html` は現行版を置き換えない独立した比較面です。
`archive/shape-study.json` の `INPUT_WAIT` は実画像・実数量なしを意味し、推定値を埋めません。
READY後だけ、sourceの明示allowlist・固定commit・実manifest/BOM/native geometryのhashを持つ
軽量summaryを配信します。native CADや大きいBlender/meshはこの比較には追加しません。
同じcharacter/viewのcamera/scale/palette条件IDを一致させ、9行すべての画像identityと実数量を検査します。

`site/shape-study-baseline.json` とテストが、採用済みr3の585成果物・current registry・Release/出典記録を
固定します。比較の増減は実instance数の差分で、型数・STL数とは区別します。
最小短辺・長辺・厚みが別部品に由来する場合に、架空の最小XYZ部品を表示しないよう各最小値と明記します。
`validate_shape_study.py` が画像の実hashと軽量payload予算、current r3不変を確認します。
