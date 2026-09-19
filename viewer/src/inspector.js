import { assemblyScope, findParts, isPartVisible, retentionRiskText, SUPPORT_CLASSES } from './data.js';
import { $, $$, element, number, setPressed, swatch } from './dom.js';

const PAGE_SIZE = 12;

export class PartsInspector {
  constructor(onSelect) {
    this.onSelect = onSelect;
    this.page = 0;
    this.bomMode = 'colors';
    this.selectedId = null;
    $('#part-search').addEventListener('input', () => { this.page = 0; this.renderList(); });
    $('#only-visible').addEventListener('change', () => { this.page = 0; this.renderList(); });
    $('#only-underside').addEventListener('change', () => { this.page = 0; this.renderList(); });
    $('#support-filter').addEventListener('change', () => { this.page = 0; this.renderList(); });
    $('#parts-prev').addEventListener('click', () => { this.page = Math.max(0, this.page - 1); this.renderList(); });
    $('#parts-next').addEventListener('click', () => { this.page += 1; this.renderList(); });
    $$('[data-bom]').forEach((button) => button.addEventListener('click', () => {
      this.bomMode = button.dataset.bom;
      setPressed($$('[data-bom]'), (node) => node === button);
      this.renderBOM();
    }));
  }

  clear() {
    this.manifest = null;
    this.index = null;
    this.page = 0;
    this.selectedId = null;
    $('#part-search').value = '';
    $('#part-search').disabled = true;
    $('#only-visible').checked = false;
    $('#only-visible').disabled = true;
    $('#only-underside').checked = false;
    $('#only-underside').disabled = true;
    $('#support-filter').value = '';
    $('#support-filter').disabled = true;
    $('#support-filter-control').hidden = true;
    $('#part-list').replaceChildren();
    $('#part-list-count').textContent = '—';
    $('#search-status').textContent = 'モデルを読み込むと部品を検索できます。';
    $('#parts-page').textContent = '—';
    $('#parts-prev').disabled = true;
    $('#parts-next').disabled = true;
    $('#bom-summary').textContent = '—';
    $('#bom-table').replaceChildren(element('p', 'section-empty', 'モデルの読み込み後に構成を表示します。'));
    this.renderSelected(null);
  }

  load(manifest, index, progress) {
    this.clear();
    this.manifest = manifest;
    this.index = index;
    this.progress = progress;
    $('#part-search').disabled = false;
    $('#only-visible').disabled = false;
    $('#only-underside').disabled = false;
    $('#support-filter').disabled = manifest.schema_version !== 2;
    $('#support-filter-control').hidden = manifest.schema_version !== 2;
    const supportOptions = [element('option', '', 'すべての区分')];
    supportOptions[0].value = '';
    for (const supportClass of new Set(manifest.parts.map((part) => part.support_class).filter(Boolean))) {
      const option = element('option', '', SUPPORT_CLASSES[supportClass]);
      option.value = supportClass;
      supportOptions.push(option);
    }
    $('#support-filter').replaceChildren(...supportOptions);
    $('#part-list-count').textContent = `全 ${number(manifest.parts.length, 0)} 個`;
    $('#bom-summary').textContent = `${index.colors.size}色 / ${index.types.size}型`;
    this.renderList();
    this.renderBOM();
  }

  setProgress(progress) {
    this.progress = progress;
    if (!this.manifest) return;
    if ($('#only-visible').checked) this.renderList();
    else {
      $$('.part-row').forEach((row) => {
        const part = this.index.partsById.get(row.dataset.partId);
        const visible = this.visible(part);
        row.classList.toggle('part-row-hidden', !visible);
        row.setAttribute('aria-label', this.partLabel(part));
      });
    }
    this.renderSelected(this.selectedId);
  }

  visible(part) {
    return isPartVisible(part, this.index, this.progress.layers, this.progress.steps);
  }

  partLabel(part) {
    return `${part.id}、${part.type_id}、${this.manifest.palette[part.color_id].name}、第${part.layer + 1}層、順序候補${part.step}${part.insertion_axis === '+Z' ? '、下側からの後付け候補' : ''}${part.support_class ? `、${SUPPORT_CLASSES[part.support_class]}` : ''}${this.visible(part) ? '' : '、現在は非表示'}。選択`;
  }

  renderList() {
    if (!this.manifest) return;
    const results = findParts(this.index, this.manifest, $('#part-search').value, $('#only-visible').checked, this.progress.layers, this.progress.steps, $('#only-underside').checked, $('#support-filter').value);
    const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
    this.page = Math.min(this.page, pageCount - 1);
    $('#search-status').textContent = results.length ? `${number(results.length, 0)} 個の部品が見つかりました` : '一致する部品がありません。ID・色名、または表示範囲を変えてください。';
    const list = $('#part-list');
    list.replaceChildren();
    list.start = this.page * PAGE_SIZE + 1;
    const fragment = document.createDocumentFragment();
    for (const part of results.slice(this.page * PAGE_SIZE, (this.page + 1) * PAGE_SIZE)) {
      const item = element('li');
      const button = element('button', 'part-row');
      button.type = 'button';
      button.dataset.partId = part.id;
      button.classList.toggle('part-row-hidden', !this.visible(part));
      button.setAttribute('aria-label', this.partLabel(part));
      button.setAttribute('aria-pressed', String(part.id === this.selectedId));
      const name = element('span', 'part-row-id', part.id);
      name.append(element('span', 'part-row-type', `${part.type_id} · ${this.manifest.palette[part.color_id].name}`));
      if (part.insertion_axis === '+Z') name.append(element('span', 'part-attachment-tag', '下側からの後付け候補'));
      if (part.support_class) name.append(element('span', 'part-support-tag', SUPPORT_CLASSES[part.support_class]));
      if (part.retention_risks?.length) name.append(element('span', 'part-attachment-tag', `保持リスク記録 ${part.retention_risks.length}項目・実機未確認`));
      button.append(swatch(this.manifest.palette[part.color_id].hex), name, element('span', 'part-layer', `L${part.layer + 1}`));
      button.addEventListener('click', () => this.onSelect(part.id));
      item.append(button);
      fragment.append(item);
    }
    list.append(fragment);
    $('#parts-page').textContent = `${this.page + 1} / ${pageCount}`;
    $('#parts-prev').disabled = this.page === 0;
    $('#parts-next').disabled = this.page >= pageCount - 1;
  }

  renderSelected(id) {
    this.selectedId = id;
    const part = this.index?.partsById.get(id);
    const host = $('#part-details');
    host.replaceChildren();
    $('#clear-selection').hidden = !part;
    $('#focus-part').hidden = !part;
    if (!part) {
      host.append(element('p', 'selection-empty', '3Dのブリックをクリック。または下の部品一覧から選択できます。'));
      const link = element('a', 'inline-link', '部品IDで探す ↓');
      link.href = '#parts-title';
      host.append(link);
    } else {
      const color = this.manifest.palette[part.color_id];
      host.append(element('p', 'part-id', part.id));
      const facts = element('dl', 'part-facts');
      const values = [
        ['型番', part.type_id],
        ['色', `${color.name} · ${color.hex}`],
        ['層', `第${part.layer + 1}層（layer ${part.layer}）`],
        ['順序候補', number(part.step, 0)],
        ['元の位置', `${part.position_mm.map((v) => number(v, 3)).join(', ')} mm`],
        ['Z回転', `${part.rotation_z_deg}°`],
      ];
      if (part.insertion_axis) {
        values.push(['接続先候補', part.attach_to ?? 'なし（開始候補）']);
        values.push(['差込候補', part.insertion_axis === '+Z' ? '+Z · 下側からの後付け候補' : '−Z · 上側からの候補']);
        values.push(['公称経路', assemblyScope(this.manifest.assembly).label]);
      }
      if (part.support_class) {
        const type = this.manifest.types[part.type_id];
        values.push(['支持・保持', SUPPORT_CLASSES[part.support_class]]);
        values.push(['実機状態', '嵌合・保持力未確認 / UNKNOWN']);
        values.push(['占有形状', `${type.footprint_cells.length}セル / 外接 ${type.cells.join(' × ')}セル`]);
        values.push(['組み替え', part.changed_grouping ? '基準部品を組み替え' : '基準のまとまりを維持']);
      }
      for (const [label, value] of values) {
        const row = element('div');
        const definition = element('dd', label === '色' ? 'part-color' : '', value);
        if (label === '色') definition.prepend(swatch(color.hex));
        row.append(element('dt', '', label), definition);
        facts.append(row);
      }
      host.append(facts);
      if (part.retention_risks?.length) {
        const risks = element('div', 'hidden-part-note');
        risks.append(element('strong', '', '保持リスクの記録（実機未検証）'));
        const list = element('ul');
        list.append(...part.retention_risks.map((risk) => element('li', '', retentionRiskText(risk))));
        risks.append(list);
        if (Number.isFinite(part.self_weight_bearing_margin_mm)) risks.append(element('p', '', `単体自重の幾何投影余裕：${number(part.self_weight_bearing_margin_mm, 3)} mm`));
        risks.append(element('p', 'control-help', '上層荷重・実際の充填・衝撃・摩擦・保持力の評価ではありません。公称着座も保持の保証ではありません。'));
        host.append(risks);
      }
      if (part.baseline_part_ids) {
        const source = element('details', 'part-source-details');
        source.append(element('summary', '', `基準部品ID ${number(part.baseline_part_ids.length, 0)}件`),
          element('p', 'mono', part.baseline_part_ids.join(' / ')));
        if (part.feature_tags?.length) source.append(element('p', '', `特徴：${part.feature_tags.join(' / ')}`));
        source.append(element('p', 'control-help', '基準IDは対応元の情報です。実機で確認済みの組立・保持を示しません。'));
        host.append(source);
      }
      if (part.required_aids?.length) {
        const aidDetails = element('details', 'part-source-details');
        aidDetails.open = true;
        aidDetails.append(element('summary', '', `設計上必要な仮支持台 ${part.required_aids.length}件`));
        for (const id of part.required_aids) {
          const aid = this.manifest.assembly.aids.find((entry) => entry.id === id);
          aidDetails.append(element('p', 'mono', aid.id));
          if (aid.withdrawal_axis) aidDetails.append(element('p', '', `設計上の退避方向：${aid.withdrawal_axis} / 実機での取り外しは未確認`));
          if (aid.nominal_clearance_check) aidDetails.append(element('p', 'control-help', `退避の格子チェック：${aid.nominal_clearance_check}。手・工具・変形・保持力の確認とは別です。`));
          if (aid.role) aidDetails.append(element('p', 'control-help', aid.role));
          if (aid.removal_gate === 'DO_NOT_REMOVE_UNTIL_PHYSICAL_RETENTION_CONFIRMED') {
            aidDetails.append(element('p', 'hidden-part-note', '実機の保持力を確認するまで、仮支持台を外さない条件です。'));
          }
        }
        aidDetails.append(element('p', 'control-help', '補助具の設計情報です。3Dの本体部品数や初回の接合部試験セットには含めていません。'));
        host.append(aidDetails);
      }
      if (color.source) {
        const source = element('p', 'control-help', `色の参照元：${String(color.source)}`);
        host.append(source);
      }
      $('#focus-part').disabled = !this.visible(part);
      if (!this.visible(part)) host.append(element('p', 'hidden-part-note', 'この部品は現在の層・手順の範囲外です。進行を進めると3Dに表示されます。'));
    }
    setPressed($$('.part-row'), (node) => node.dataset.partId === id);
  }

  renderBOM() {
    if (!this.manifest) return;
    const table = element('table');
    table.setAttribute('aria-label', `完成形の${this.bomMode === 'colors' ? '色別' : this.bomMode === 'types' ? '型別' : '色と型別'}部品表`);
    const caption = element('caption', 'sr-only', '層・手順によらない完成形の全ブリック数');
    const head = element('thead');
    const headRow = element('tr');
    const firstHeading = element('th', '', this.bomMode === 'colors' ? '色・参照カラー' : this.bomMode === 'types' ? '型番・セル数' : '色 × 型番');
    firstHeading.scope = 'col';
    const countHeading = element('th', '', '個数');
    countHeading.scope = 'col';
    headRow.append(firstHeading, countHeading);
    head.append(headRow);
    const body = element('tbody');
    let rows;
    if (this.bomMode === 'colors') rows = [...this.index.colors].map(([colorId, count]) => ({ colorId, count }));
    else if (this.bomMode === 'types') rows = [...this.index.types].map(([typeId, count]) => ({ typeId, count }));
    else rows = [...this.index.groups.values()].map((group) => ({ colorId: group.colorId, typeId: group.typeId, count: group.parts.length }));
    rows.sort((a, b) => b.count - a.count);
    for (const row of rows) {
      const tr = element('tr');
      const cell = element('td');
      if (row.colorId) {
        const color = this.manifest.palette[row.colorId];
        const title = element('span', 'bom-color');
        const name = element('span', 'bom-color-name', color.name);
        name.append(element('small', '', row.typeId ? `${color.hex} · ${row.typeId}` : `${color.hex} · ${row.colorId}`));
        title.append(swatch(color.hex), name);
        cell.append(title);
        if (color.source) cell.title = `色の参照元: ${String(color.source)}`;
      } else {
        const type = this.manifest.types[row.typeId];
        const label = element('span', 'bom-type', row.typeId);
        label.append(element('small', '', type.footprint_cells
          ? `占有 ${type.footprint_cells.length}セル / 外接 ${type.cells.join(' × ')} · ${number(type.pitch_mm)} mm`
          : `${type.cells.join(' × ')} セル · ${number(type.pitch_mm)} mmピッチ`));
        cell.append(label);
      }
      const ratio = element('span', 'bom-ratio');
      ratio.setAttribute('aria-hidden', 'true');
      const bar = element('span');
      bar.style.setProperty('--ratio', `${row.count / this.manifest.parts.length * 100}%`);
      if (row.colorId) bar.style.setProperty('--swatch-color', this.manifest.palette[row.colorId].hex);
      ratio.append(bar);
      cell.append(ratio);
      tr.append(cell, element('td', '', number(row.count, 0)));
      body.append(tr);
    }
    const foot = element('tfoot');
    const total = element('tr');
    total.append(element('td', '', '合計'), element('td', '', number(this.manifest.parts.length, 0)));
    foot.append(total);
    table.append(caption, head, body, foot);
    $('#bom-table').replaceChildren(table);
  }
}
