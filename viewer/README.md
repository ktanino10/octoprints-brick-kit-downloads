# 公開組立ビューア

[日本語](https://ktanino10.github.io/octoprints-brick-kit-downloads/ja/viewer/) /
[English](https://ktanino10.github.io/octoprints-brick-kit-downloads/en/viewer/) /
[従来のURL](https://ktanino10.github.io/octoprints-brick-kit-downloads/viewer/)

選定 `r2-20260919` の3案を既定表示し、`?mode=phase1` で候補9案の履歴へ切り替えます。
`?candidate=mona-fine` 等で直接指定できます。元の配置・型別メッシュを使用し、表示のための代替形状を生成しません。

完成形、分解、層、順序候補、部品クリック、ID検索、色・型別BOM、視点、画像・実生成動画に対応します。
順序は公称幾何からの候補であり、承認済みの組立説明書ではありません。
4 mm初回試作で小ささ・穴詰まりが報告されており、全数印刷は保留です。

## 静的配信

実行時のサーバーAPI、CDN、外部フォント、解析送信は不要です。`assets/` のビルド済みJS/CSSを配信します。
データの内部識別子 `/artifacts/...` は検証用の論理パスとして保持し、取得時に
`paths.js` でサイトのプロジェクトベースURLへ変換します。ルート公開・サブパス公開の両方を扱います。

`archive/status.json` は公開時点の固定記録です。制作環境の最新性や物理合格を認定するAPIではありません。
配置・カタログ・メッシュ・状態ファイルの欠損は画面へ表示し、旧版やダミー形状へ黙って置き換えません。
動画は同一サイトから `video/mp4` とRange対応で配信し、明示的に開くまで読み込みません。

## 開発

```sh
cd viewer
npm ci --no-audit --no-fund
npm test
npm run build
```

ブラウザー試験と公開ファイル照合はリポジトリの `tools/` を参照してください。
ビルドの第三者ライセンスは同梱します。CAD実行・保存・アップロード・プリンター接続・印刷送信の機能はありません。

## 表示言語と共有状態

共通カタログ `site/i18n/` と `assets/i18n.js` は、表示テキスト・aria・説明属性のみを切り替えます。
機械可読データやモデルのID・数値・形状は翻訳しません。英語URLは最初から英語で、
ブラウザー言語・Cookie・localStorageで黙って別言語へ転送しません。
言語切替では3Dキャンバスを作り直さず、選択部品・検索・フィルター・BOM・分解/層/手順・カメラを保持します。
共有URLの `view` は表示状態だけで、型・範囲・部品IDを検証して復元します。
不正な共有指定はエラーを表示し、製造の承認や新しいモデルとして解釈しません。
