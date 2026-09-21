import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { monaStudyPath, validateMonaPointer, validateMonaStudy } from '../assets/mona-study-data.js';

const root = new URL('../', import.meta.url);
const pointer = validateMonaPointer(JSON.parse(await readFile(new URL('archive/mona-study.json', root), 'utf8')));
if (pointer.state === 'INPUT_WAIT') {
  console.log('Mona likeness study: INPUT_WAIT. No new image or count is published; current r3 is unchanged.');
} else {
  const bytes = await readFile(new URL(monaStudyPath(pointer.data_url).slice(1), root));
  if (createHash('sha256').update(bytes).digest('hex') !== pointer.data_sha256) throw new Error('Mona summary hash mismatch');
  const study = validateMonaStudy(JSON.parse(bytes), pointer);
  console.log(JSON.stringify({
    study_id: study.study_id,
    rows: study.rows.map((row) => ({ role: row.role, candidate_id: row.candidate_id,
      part_count: row.metrics.part_count, dimensions_mm: row.metrics.dimensions_mm })),
    comparison_groups: study.comparisons.map((group) => ({ id: group.id, kind: group.kind, framing_rule: group.framing_rule })),
    current_revision_unchanged: study.current_revision_unchanged,
    selection: study.selection, physical_fit: study.physical_fit, full_print: study.full_print,
  }, null, 2));
}
