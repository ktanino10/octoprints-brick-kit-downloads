# COPILOT / 組立順の候補

COPILOT: 695 separately identified parts / 86 types / 181.0 mm high.

**デジタル上の手順候補です。保持力・耐荷重・実際の全体組立・全数印刷は未承認です。**

まず新版の少数の共通ブロックを試し、結果を確認します。型/色別数量は `bom-types-colors.csv`、個別IDは `bom.csv`、順序・座標・支持先は `assembly-steps.csv` にあります。

最初に低い基礎プレート2層を組み、実Zが低い順・step番号順へ進みます。全て上から下（−Z）の配置です。スタッドは下面の壁・筒の外側の間へ合わせます。筒の穴そのものへ押し込む方式ではありません。

layerは底面Z÷3.2 mmの整数で、ブリックは3単位・プレートは1単位です。下記図は占有面と順序番号の案内で、スライス経路ではありません。部品を選択する際は実ネイティブ形状を使う組立ビューも確認します。

1×1例外は10個で、manifestに個別IDを記録しています。部分的なスタッド接触やグラフの連結だけで、握りやすさ・摩擦・上層の荷重が確認されたとは扱いません。

- [Course 01](courses/course-01.svg)
- [Course 02](courses/course-02.svg)
- [Course 03](courses/course-03.svg)
- [Course 04](courses/course-04.svg)
- [Course 05](courses/course-05.svg)
- [Course 06](courses/course-06.svg)
- [Course 07](courses/course-07.svg)
- [Course 08](courses/course-08.svg)
- [Course 09](courses/course-09.svg)
- [Course 10](courses/course-10.svg)
- [Course 11](courses/course-11.svg)
- [Course 12](courses/course-12.svg)
- [Course 13](courses/course-13.svg)
- [Course 14](courses/course-14.svg)
- [Course 15](courses/course-15.svg)
- [Course 16](courses/course-16.svg)
- [Course 17](courses/course-17.svg)
- [Course 18](courses/course-18.svg)
- [Course 19](courses/course-19.svg)
- [Course 20](courses/course-20.svg)

無理な力、挿入の閉じ込め、成形不良、亀裂、不安定な支持があれば停止します。手・工具・変形・初層誤差・衝撃は公称検査の対象外です。
