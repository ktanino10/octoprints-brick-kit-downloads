# 制作物・試作・改善記録の公開アーカイブ / 2026-09-19

**試作・初回印刷で課題あり／改善検討中。全数印刷は保留。すべて NOT_SLICED。**

[公開サイト](https://ktanino10.github.io/octoprints-brick-kit-downloads/) ·
[組立ビューア](https://ktanino10.github.io/octoprints-brick-kit-downloads/viewer/) ·
[全配布カタログ](https://ktanino10.github.io/octoprints-brick-kit-downloads/downloads.html) ·
[初回実物フィードバック](https://ktanino10.github.io/octoprints-brick-kit-downloads/feedback.html)

| ZIP | 保存範囲 |
|---|---|
| `phase1-candidates.zip` | 候補9種のBlender・画像・配置・BOM、Balanced動画3本 |
| `phase1-cad.zip` | 旧FreeCAD、21基本型のSTEP/STL、歴史的6 mmクーポン5個 |
| `selected-r2-scenes.zip` | Mona Fine 4 mm、Copilot Chunky 8 mm、Ducky Fine 4 mmのBlender・画像・動画・BOM・組立候補 |
| `selected-r2-cad.zip` | 236型、共有FreeCADライブラリー2冊、組立3体、4/8 mm各11部品の試験、Monaの左右ひげ受け台 |

ZIPは全て展開してください。選定版の
`artifacts/selected/r2-20260919/cad/assemblies/` と隣の `libraries/` の相対配置を保ちます。
別の場所へ展開したパッケージで、全11 FreeCAD文書の再オープンとリンク解決を確認しています。
12 Blenderシーンも、公開用のパス整理前後で形状・配置を変えず再オープンしています。

選定r2の配置は **13,434 + 3,021 + 10,311 = 26,766個の個別ID** が **236種類の形状**を共有します。
26,766個の別々のSTLではありません。継ぎ目の変更があり、Phase1と画素単位で同一とは主張しません。
画像・動画、個別ファイル、従来の4 mm試験2ファイル、実物写真10枚・無音動画2本＋結合版、
改善検討の記録もこの公開リポジトリに保存しています。

初回4 mm試作では「小さくて作りにくい」「穴が樹脂で埋まる」と報告されています。
穴詰まりは超音波洗浄の前から発生。原因・条件別保持力・反復着脱・全体組立は未確定です。
CAD・メッシュ・公称経路の数値検証は、物理嵌合・製造の合格ではありません。
手でつかめる共通ブロックへの変更は検討段階で、新案は未採用です。

付随メタデータのみを整理し、ローカルパス・実行環境・内部ログ・会話・元の個人媒体は含めていません。
現在のZIPは添付 `SHA256SUMS.txt`、個別公開ファイルは
[全ファイル目録](https://ktanino10.github.io/octoprints-brick-kit-downloads/archive/inventory.json) で照合できます。
当時の検証JSONにあるハッシュは当時の入力に対応し、公開用派生物のハッシュとは区別しています。

原型：`martinwoodward/octoprints` contributors、revision `981a85f0bec9d1a9c280fd5719d0d797852229c4`。
モデル派生物は **CC BY-NC 4.0**。各ZIPにLICENSE・ATTRIBUTION・状態と案内を同梱しています。
実物写真・動画は提供者所有で、公開許可が一律のCC許諾になる意味ではありません。
GitHub・LEGOの推奨・認証・互換性を主張しません。
