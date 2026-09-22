# 公開アーカイブの保守

通常のPages更新は、保存済みの成果物とビューアだけで行えます。制作元やCADソフトウェアは不要です。

## 初めての人向けカタログと制作履歴

トップと既存の `models.html` は同じ `site/templates/index.html` を使います。
`assets/print-catalog-data.js` はREADY受領記録・ハッシュ付き公開検証に結び付いた15案だけを扱い、
Mona 519 / Copilot 695 / Ducky 413個の少部品r3や基準参照を通常候補へ混ぜません。
3枚のキャラクターカードで5案ずつ選べ、実画像・個数・完成寸法・別勘定の支台数・ZIP・組立ガイドを同時に切り替えます。
公開READYを印刷合格には読み替えず、全案を実物未検証・NOT_SLICED・全数印刷保留として表示します。

試行錯誤は `history.html` に分離し、初期9案、実物フィードバック、旧r3、外観改良の記録へ案内します。
旧CAD・画像・Releaseと版のメタデータは不変です。旧r3のZIPはファイル目録の閉じた履歴欄に残します。
`browser_print_catalog.py` は日英の全15選択、旧 `models.html` URL、言語切替/再読み込み、
390pxで44px以上の選択欄、初期画面で旧案・動画・ネイティブを自動取得しないこと、
検証記録/画像の欠落や旧案IDの指定時に代替モデルを出さないことを確認します。
これは表示導線の変更であり、新しいCAD生成や実機の印刷承認ではありません。

各カードの「360°回転で見る」は、選択中の実モデルだけを遅延読み込みする単一のダイアログです。
`viewer/src/catalog-preview.js` は既存の `DensityStudio` と、組立ガイドと共通の
`density-load.js` のSHA/根元証拠/全ID/表示LOD検査を使います。画像を回したり箱で代用したりしません。
ドラッグ・タッチ回転、30度ずつの操作、正背面、拡大縮小に対応し、閉じると通信を中止してGPU資源を破棄します。
回転専用のため部品ray-pickingは行わず、原形の詳細と組立は既存ガイドへ案内します。
ローカライズは既存の `assets/i18n.js` を共有し、遅延バンドルへ再登録しません。
既存ビューアの4 MB上限は維持し、新しい遅延バンドルだけを750 KB未満で別途制限しています。
`browser_catalog_rotation.py` は全15実モデル、3体の360度復帰、ドラッグ、最大案の390pxタッチ設定/タップ操作、
Escape、読み込み中の中止と別キャラへの切替、形状欠損時の明示エラーを確認します。実スマートフォン実機での保証ではありません。

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

`site/templates/` が14ページの共通HTML、`site/routes.json` が既存URLと `/ja/`・`/en/` の対応です。
ルートの既存日本語ページを含む42個の薄いHTMLを生成し、画像・動画・CAD・モデルJSONは共有します。
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

公開済みスタディの原本は `artifacts/studies/shape-study-20260920/study.json`、
表示用の明示変換は同じ場所の `public-study.json` です。32個の許可ファイルは元バイトを保持し、
表示用summaryを加えた33ファイルは約5.14 MiBです。
`import_shape_study.py --handoff <private-ready-receipt>` は、そのreceiptとallowlistのhashを確認し、
明示された実manifest/BOMのID・型・色・配置・個数を読み取り専用で照合しました。
receiptや絶対パスは公開せず、パスなしの照合記録を `archive/sources/` に残します。
取り込み済みフォルダーの上書きは拒否します。

`browser_shape_options.py` は日英の9行、3体×2視点、実画像、数量・型数・各最小値、
言語切替・共有URL・再読み込み、390px表示と通信失敗を確認します。
`verify_publication.py --study shape-study-20260920` は通常の `--revision`・公開commit指定に加え、
新しい比較のREADY/未採用/未検証状態を匿名で確認します。現在版と既存Releaseカタログに変更があれば失敗し、
不変の大型ZIPを再ダウンロードせず、今回追加・変更した画像・summary・UIだけを全件hash照合します。
比較を追加するだけの場合、現行registryや正式Releaseを更新しません。

## Monaの再現度・サイズ比較

`mona-likeness.html` と `archive/mona-study.json` は、Mona1体の別スタディ
`mona-likeness-360-20260921` を扱います。初期細密Cの顔・体形・丸みを基準とし、
約360 mmは目標、部品数は実構成の結果です。低い部品数や大きな表示を品質合格と扱いません。
`INPUT_WAIT` の間は新しい画像・数量の参照先を持たず、候補の代理画像も表示しません。

公開用の小さな表示schemaは `assets/mona-study-data.js` が検証します。原型の部品・型・配置層は
`NOT_APPLICABLE` と `null`、初期Cとr3は実ID/配置の同一性、新案は原型からの再サンプリング証跡を要求します。
原型に架空の0部品を割り当てません。sourceのcandidate IDを保存し、表示用roleだけを独立させます。
READY受領時のadapterはsource schemaに合わせ、実manifest/BOM・許可画像・小summary以外を公開しません。
`mona_study_evidence.py` は実manifestとBOMのID・型・色・配置・順序を照合し、使用型・1×1例外・
各最小寸法・長辺15.8 mm以上の部品・実際に存在する配置層を再集計します。
初期Cの本体厚2.28 mmと配置間隔2.4 mmを混同せず、非連番のr3層を最大indexから水増ししません。
同一性照合はcandidate名の別名化を許容しますが、部品ID・形状寸法・色・姿勢・順序の変更は拒否します。

比較条件は `shape`（同じ画面上高さ）、`face`（同じ正規化顔領域）、`scale`（同px/mmの実寸比）を分離します。
前2種類は4列の画像を同じ表示寸法で扱い、実寸比はsourceの一枚図を再配置・個別リサイズせず表示します。
形比較は本体Z高さだけでなく、実頂点投影から得た画面範囲の高さを1 px以内で照合します。
顔は土台を除いたsource-body登録に基づく共通領域、実寸比は各モデルのpx/mm一致を要求します。
画像にCSS拡大や切り抜きを加えず、比較条件の説明と証跡hashを保持します。
`comparison` クエリー、言語切替、再読み込み、戻る/進むは同じ条件を維持します。

`check_mona_study.mjs` が表示schemaと状態を、`validate_mona_study.py` が画像hash・80 MB以内の
軽量入力と以前の32比較ファイルの不変を確認します。`site/mona-study-baseline.json` は
旧版/R3の不変snapshot自体、以前のA/B summary・出典・pointerを固定します。
`browser_mona_study.py --expect-input-wait` は未受領時の無画像・無数量・日英・390px・エラー表示を確認します。
READY後は同フラグなしで原型N/A・実数・4列・顔・実寸比・実画像・言語/共有URLを確認します。
現行r3のregistry、試験片、33プレート、正式Releaseは変更しません。
`verify_publication.py --study mona-likeness-360-20260921` はMona固有のpointer・未採用・見た目承認待ちを検査し、
Pagesの実commitと今回変更した実ファイルを匿名照合します。既存の大型Releaseを再ダウンロードしません。

`import_mona_study.py --handoff <private-ready-receipt>` は固定commitとreceipt SHAを検証し、
許可された23ファイル約3.81 MiBだけを元バイトで導入します。明示された7つの検証用入力は読み取り専用で、
公開側へコピーしません。新しい画像・CAD・形状は生成しません。
原型の3MF印刷寸法は約69.126 × 56.769 × 60.776 mmで、画面正規化後の大きさとは別です。
初期C・r3の元ID/型/姿勢と、新案の10,908部品/137型を実BOMから照合します。
Blender実camera行列には単精度誤差があるため、宣言したbasis/位置を1e-6の絶対許容差で確認します。
形比較の投影高さは864 px、実寸比は各モデル2.5 px/mm。顔領域は画像内0〜1ではなく、
土台を除く原型体高を単位とするX/Z領域であり、負のXや1を超えるZを正しく保持します。

## 初期Cへ近づける追加Mona比較

`mona-refinement.html` / `archive/mona-refinement.json` は独立した
`mona-fine-c-refinement-20260921` の3行比較です。初期C 13,837と前の36 cm案10,908を別々の基準にします。
元の `mona-likeness.html?comparison=...` は同じ最初の36 cmモデルを表示し続けます。
`site/mona-refinement-baseline.json` が最初の23入力、公開summary、pointer、出典・照合記録を保護します。

画像表示・正規化条件の検証は `assets/study-ui.js` / `assets/study-comparisons.js` を最初の比較と共有します。
追加比較は既定で顔拡大を選び、3案すべての同画面高・同顔領域を要求します。
新案の画像hashを旧2案と区別し、実ID/type/pose/単色の構成とレンダーの一致を要求します。
描画テクスチャだけの変更、同じ旧構成の別名化、全体の物理合格への繰上げを受け付けません。

`body_height_families` は `body_height_mm` / `part_count` / `unique_types` の配列です。
実manifestの使用型から `body_height_families()` で再集計し、部品・型の合計を照合します。
新しい高さの種類を3.2/9.6 mmへ丸めず、そのまま表示します。初期Cの本体2.28 mmと配置Z間隔2.4 mmも区別します。
高さfamilyはFDM印刷層高ではありません。実部品数の上限や「多ければ美観合格」という条件は設けません。

`check_mona_refinement.mjs` と `validate_mona_refinement.py` は、入力待ちで実データが存在するように
見せないこと、前版不変、READY後の画像hashと60 MB以内の軽量公開を検証します。
`browser_mona_refinement.py --expect-input-wait` は未受領の無画像・無数量・日英・390px・エラーを確認し、
READY後は同フラグなしで実数・高さfamily・全画像・顔優先の共有状態・非切抜き・欠損時の表示を確認します。
共通表示コードの変更時は `browser_mona_study.py` で既存4列比較も回帰確認します。
公開後は `verify_publication.py --study mona-fine-c-refinement-20260921` で変更分だけを匿名照合します。
本体CAD・Blender・大規模mesh・プリントデータはこの比較の公開範囲外です。

`import_mona_refinement.py --handoff <private-ready-receipt>` は固定commit
`02918d3bffd4db065656f5ffe7e037da1b0754d8` の21許可ファイルを元バイトでコピーします。
14件の実manifest/BOM・render-stats・depth-camera・native-scene-binding・小native-contractは
明示されたものだけを読み取り、コピーしません。最終入力は `manifest-edge-refined.json` と
`edge-finished/bom.csv` で、保存された中間の `manifest.json` ではありません。
全35入力のGitblob/サイズ/SHAを確認し、12,435配置・121使用型・実高さfamily・単色・保存sceneの対応を照合します。
native検証記録はsource担当の再open結果として扱い、publisherが私有sceneを再生成したとは主張しません。
公開proofには入力パス・実行コマンド・ログを残さず、必要なSHA・実数・判定根拠だけを保存します。

## 3体×5個数倍率の実CG・CAD・3D組立

`density-matrix.html` と `density-guide.html` は、既存r3や以前の比較と独立した
`part-count-matrix-20260921` を扱います。1倍はユーザーが採用した設計ではなく、
3体とも初期Fine Cに近い8 mm共通ブロック版に統一する比較前提です。
Monaは最終12,435、Copilot/Duckyは制作元の実baseline確定後にだけ公開します。
倍率は個別部品数で、線形サイズでも型数でもありません。整数percentを使った
`floor((baseline * percent + 50) / 100)` でHALF_UP目標を計算し、実倍率と差分も表示します。
許容差外は `TARGET_MISSED`、未受領は `INPUT_WAIT`。全15案が4種の実配布を持つまでREADYにはしません。

実ガイドは元の `viewer/assets/studio.js` とは別の `density-guide.js` としてビルドします。
既存 `BrickStudio` の視点・実形状・描画処理を再利用し、型色ごとのInstancedMeshで配置します。
放射位置は常に `source.position_mm + source.radial_offset_mm * t` で再評価し、
0で元位置へ戻します。工程はsourceのstep1..Nとassembly_courseで底から積み、
同型同色の配置先・BOM・検索・実部品だけの裏面表示を接続します。
仮支持台は本体個数と分け、必要なstepまでに表示し、未検証の撤去を案内しません。
単なるZ層分離や分解動画の逆再生ではありません。移動は説明で、衝突/保持の物理シミュレーションではありません。

制作元の `OBM1` 型別gzipは、4-byte magic、uint32LE頂点数/三角形数、Float32LE XYZ、
Uint32LE面配列です。`density-assets.js` が圧縮bytehashと展開後の座標/面連結hashを照合し、
最大6リクエストずつ遅延取得します。`pack_density_meshes.py` の `OCBMESH1` は同じ
Float32/Uint32を型集合として保持する補助形式で、頂点・三角形を生成せず丸め誤差を記録します。
別tessellationを使う場合は `NATIVE_PREVIEW_TESSELLATION` と精度差を必ず明示します。
実shapeの欠損をboxに置換しません。モデルID・実数にlocale formattingを逆利用しません。

Pagesには小画像・catalog・圧縮geometry/placementsだけを置き、追加データを140 MB以内へ抑えます。
旧ファイルを消して容量を作りません。全 `.blend`、動画、実FreeCAD assembly/shared masters/authoring、
STL/STEP/BOM/手順は版別Releaseから公開します。`.FCStd`相対layoutはパッケージ全展開後に
別ディレクトリーで再open確認します。ReleaseへのJS fetchを前提にせず、ガイドmeshはPagesから取得します。
動画だけはHTML mediaとしてGitHubとrelease-assetsのCSPを許可し、実公開のRange/MIME/章再生を検証します。
GitHub ReleaseのCDNは、upload時がvideo/mp4でも配信時にapplication/octet-streamを返すことがあります。
この場合は実MP4のftyp・全SHA・206 Rangeと、実ブラウザーで全章がdecode/playできることを別々に確認します。
WebKitではCDNの汎用MIMEだけでは再生を拒否する場合があるため、
実検証済みの動画に `<source type="video/mp4">` を明示します。メタデータ読込だけでなく各章の実再生を検証します。

`check_density.mjs` / `validate_density.py` が実数・0/全ID・工程・放射roundtrip、版不変、容量を検査します。
`browser_density.py --expect-input-wait` は未受領UIだけを検証し、READY後はフラグなしで
実cases・各動画章・部品選択・前後左右/裏面・空から組立・日英共有URL・390pxを確認します。
`browser_density_unit.py` の8部品は明示された非公開のUNIT FIXTUREで、
制作案や実nativeケースの受入結果ではありません。テストcontextのroute応答以外へ保存・配信しません。
`browser_density_performance.py` は指定した実caseについて、初回読込、回転入力からGPU完了まで、
放射slider入力から全配置matrix更新・GPU完了までを1440pxと390pxで記録します。
美観や製造の合格指標とは無関係で、測定ホスト上の描画応答の証拠です。
390pxのエミュレーションを実機スマートフォンの速度保証と読み替えません。最大実caseの測定は、
そのcaseの正式READY入力がそろった後に実施します。

親向け受領記録は `archive/block-budget-matrix.json` です。
`make_density_receipt.py` は全15実案と公開browserの全case/動画章、匿名全ダウンロードSHAを受けるまで
PARTIALのままにします。commit自己参照は `archive/deployment.json` の実commitを参照し、
検査済み内容のcommitは別フィールドに保存します。`verify_density_publication.py` は
変更したPagesファイルと新matrixのRelease assetsだけを匿名照合し、旧大型履歴を再ダウンロードしません。
増分browser受入は `--case` で今回の実案に限定できます。配信検査は直前の公開catalogと比較して
変更案・変更baselineの全動画章を必須にし、未変更案を再検査しなかった場合は
`PASS_CHANGED_CASES_AND_BASELINES` と明示します。この部分検査を全15案完了の証拠には使えません。

`density_release.py` は明示された公開copyのhash一覧、Blenderのgeometry/material/animation保存照合、
FreeCAD移動reopen記録がすべて一致した場合だけRelease専用ZIPを作ります。
`cases/<case>/assembly.FCStd` から `shared/masters/` や `shared/authoring/` への相対linkを
パッケージ内で解決できることを検査します。圧縮時はファイルをstream転送し、100 MBのGit制限を
Release資産へ誤適用しません。ただし単一Release assetの2 GB上限は超えられません。
既存ZIPの上書き、未記録のnative文書、未確認のanimation変更、機械pathの混入は拒否します。

1倍の参照3体は `stage_density_baselines.py` / `install_density_baselines.py` で別の固定READY packetとして扱います。
64 MiBチャンクで保存された元ZIPは、固定commit内の再構築記録・各chunk・連結後SHAを照合し、
公開Releaseには分割チャンクではなく全ZIPを置きます。`prepare_density_native_copy.py` と
`finalize_density_package.py` は同じmetadata-only/reopen/motion検査を参照にも適用します。
`COUNTED` から `READY` へ進めるのは参照のCG/native/mediaだけで、15倍率案の件数は増えません。
親向けreceiptの `baseline_references` は `counts_toward_multiplier_cases:false` を必須とします。

### 追加条件：Monaのヒゲ支台なし

歴史的な `case.state:READY` は実ファイル完成を表すだけで、現在の要求への適合は
`densityDeliveryStatus()` / `density_requirements.delivery_status()` が別に判定します。
支台が必要な旧Monaは `REQUIRES_WHISKER_REVISION` とし、CGや支台配列を隠して成功へ昇格しません。
新Monaの `whisker_support` は外部/組立支台数0、`DIGITAL_SELF_SUPPORTING_UNTESTED`、
physical UNKNOWN、新geometry revision、実manifestSHAと根元・順序検査SHA、全カテゴリのgeometry一致を要求します。
配信receiptは `source_status` と `status`、データ公開数と新要件適合数を分離します。
Copilot/DuckyにはMona固有の条件を適用せず、旧MonaのURL/画像/Releaseは残します。
新revisionの実native・順序・CG・動画を同producerから受領するまで、適合判定を進めません。

比較の15枠は `logical_case_id`、実ファイル/ガイドのIDは `id` / `candidate_id` で区別します。
新版は `mona-p120-root-v2` など、`geometry_revision:whisker-root-v2` を使います。
固定READY受入時だけ同じ比較枠へ切替え、旧実案は `historical_cases` へそのまま移します。
旧 `?case=mona-p120` は旧形状を解決し続け、新版へ暗黙転送しません。履歴は15案へ重複計上せず、
別案の増分receiptによる履歴改変・再採用・未検証案の同時昇格も拒否します。
新版manifest/instance/summary間の論理枠とgeometry revisionを一致させ、既存バイトは上書きしません。
固定packetがMonaの比較枠を未完成root-v2へ切り替えた場合も、旧支台版は履歴へ退避できます。
新枠は無画像・実数なしのINPUT_WAITのままで、他caseのREADYに便乗して完成へ昇格させません。

新版の実一体ヒゲmoduleは低い実底面と高い取付支持段を持ち得ます。
制作元の `BODY_FIRST_ROOT_ANCHORED` は本体を下から積み、受け側支持段でmoduleを取付ける契約です。
実 `position_mm` は改変しません。新modeは同じcase/logical/revision・全ID・形状/sequence SHAに結び付いた
公開証拠JSONを別途SHA照合して取得できた場合だけ有効にします。欠落/不一致は明示エラーです。
支持段/course非減少、support/insertion先行ID、工程区分、0aid、実root接触/断面/重心prefixを検査し、
旧caseのbody-bottom-Z非減少guardはそのまま維持します。単なるmetadata例外や旧順序へのfallbackはありません。
実guideでは支持高さと本当の部品底面を分けて表示し、根元部品の直前/直後、裏面と0aidを実ブラウザーで確認します。

`density_root_evidence.py` は、固定された実source manifestの全型・palette・parts・motion_stages・
whisker_load_casesから指定のASCII-escaped compact JSONを作り、geometry/sequence SHAを検算します。
元native-completeの根元接触reportも同じcanonical SHAで公開小証拠へ結びます。module単体の重心と実支持凸包、
各組立prefixの1 mm以上の公称CAD margin、後続部品の実ID/順序、native bearingと差込みsampleを確認します。
これは均一密度のCAD静モーメントの証拠で、印刷質量やPLA保持力の実測ではありません。
Mona2の `HIDDEN_CHEEK_BACKING` は、実sourceで `body-supported-hidden-cheek-root` の
`CT-...` / `contour-brick` と一致した場合に限り、WR専用beam断面の対象から区別します。
native single-solid/接触/差込み/全prefix重心はWRもCTも全対象を検査し、CTをaidや未検査例外にはしません。
WR4断面群とCTを含む5native/gravity対象のような構成も受けますが、−5.13 mmを含む一対象の失敗だけでも遮断します。
private full sourceは `assembly.assembly_aids`、portable/light形式はtop-level `assembly_aids` を使います。
portable形式の `origin` はfull sourceの `position_origin` と同じ意味です。フィールドを黙って無視せず、
実sourceの全ID/type/color/pose/step/dependenciesをportable manifestにも照合します。
通常部品へ補われる `source_part_ids:[自身のID]` だけは明示的な自己参照として許容し、
結合部品のsource ID一覧を変更・捏造することは拒否します。
`verify_blender_matrix_animation.py --frame 89 --frame 91` は通常6サンプルに実取付境界を追加します。

増分browserの `--case` は複数指定できます。`--skip-baseline-media` は変更していない参照動画だけを省略し、
配信検査が直前の公開catalogと比較してその範囲を再検証します。390pxは指定scope内の最大実caseを使います。

大きい公開ZIPの最終化は既存依存を入れた `.venv/bin/python tools/finalize_density_package.py ...` で実行します。
Blender 5系の圧縮scene検査には既存のzstandard依存が必要です。Releaseのdraftはタグ参照APIで404になる場合があり、
draftのasset検査はrelease IDで行います。検査コマンド失敗後にpublishを続行してはいけません。
大きい元scene等の `artifact_persistence` も、private index・reconstruction・各Gitblob chunk・結合後SHAを検算し、
portable ZIPに入ったsceneが同じ原本であることをmetadata整理前に確認します。private補助index/chunksは公開せず、
sceneやanimationをGit100MB制限に合わせて縮小もしません。

### 改訂1x参照と固定分母

`stage_density_case.py --reference` は `multiplier_cases_newly_ready:0` の
`mona-fine8-base-root-v2` だけを参照として受けます。通常のcase ID検査を1xまで広げません。
`reference_revisions` に実12,411部品のCG・CAD・動画・ガイドを追加し、`baselines.mona` の12,435、
元SHA、旧画像/ZIPおよび5つのtargetは不変にします。次の倍率案のhandoffでも参照は保持します。
表示と受領recordは固定基準・実数・差−24を分離し、旧1xは独立した履歴で取得できます。
参照guide/videoのQAは `reference_guides` / `reference_media` へ記録し、15案へ加算しません。

### 原形不変の表示用LOD

`node tools/build_density_display.mjs` は公開済み実OBMのBR/PL矩形ブロックだけから、
別の `display/geometry/` ファイルを作ります。dev-onlyの固定meshoptimizer 1.2.0（MIT）を使い、
元頂点の再配置・sloppy・component pruningをしません。0.04 mmは推定簡略誤差であり、
製造公差やHausdorff保証ではありません。全meshでEuler特性、境界/非多様体辺数、stud top-cap数、
bounds、volume差2%以内を検査し、満たさなければ生成は失敗します。根元・特殊形状・支持台は原形のままです。
原形SHAと実guideのSHAへ結ぶ別catalogを作り、実counts/ID/pose/CSV/CAD/STL/Blender/CG/支持証拠は触りません。

実3Dの表示品質から原形へ戻せます。原形ライブラリーも検証して保持し、選択部品previewは常に原形を使います。
UIに軽量表示を明記し、切替前後の同視点画像・全instance行列・選択部品の原形SHAを検証します。
新caseを受けた後はdisplay builderを再実行し、過去の固定display meshが同SHAであることも確認します。

`browser_density_performance.py --detail native|light` は入力handler、event-loop yield、描画完了、
実pointer dragとplay/pauseを分けて測ります。gl.finishの追加待ちが0でも描画負荷ゼロとは読みません。
`display/performance.json` にCP2の実測と端末/負荷条件を記録しています。390pxはdesktop上のviewportで、
実スマートフォンや全端末の滑らかさを保証しません。受領済み各実caseと最終最大案で再測定します。

### 全実案完成後の比較sheetとCSV

制作元の `comparison-sheets.json` は `COMPLETE_REAL_SIX_WAY_COMPARISONS` の固定READY補完だけを受けます。
各キャラクターは実1x参照＋5案の6列で、Monaの固定分母12,435と新参照実12,411を混同しません。
`density-comparisons.js` は全15案の受入、各columnのactualID/manifest/BOM/数量/寸法を照合します。
未完成や旧支台Monaを代用したものは拒否し、補完がない間は比較sheet領域を表示しません。

正面/斜めのnormalized sheetは、元1200px orthographic CGの実投影高864pxを580px panelへ
縮小した417.6pxへ結びます。実寸frontは元の同じ正面CGからuniform affineを使い、0.9px/mm、
800px幅panel、top140/共通ground750を検査します。縦横を別々に丸めるresizeは使いません。
これは原画像内のpx/mmであり、responsive表示後の画面を物理定規にする主張ではありません。
元PNG/render-statsは最終補完receiptの明示read-only入力で照合し、light JPEGやmetadata整理後PNGのSHAと混ぜません。

`density_comparison_evidence.py` はCSVの厳密な17列・15行と実case集合を読み、固定分母、実参照数、
目標/実数/差、実倍率、寸法、使用型と小部品数を受入catalogから再計算します。参照3行の混入は拒否します。
最終receiptのREADYには `comparison_assets` のindex/CSV/9枚のsheetすべての公開bytehashと、
実ブラウザーによる9画像/15行CSVの確認も必要です。Native/mediaが15案揃っただけでは総完了にしません。
`import_density_comparisons.py` は固定補完receiptの許可ファイルだけを取り込み、元PNGのSHAを既存のmetadata-only
保存記録へも照合します。完成前の比較画像は生成しません。元camera/CSV/全列の検査を通してからimmutableに保存します。
