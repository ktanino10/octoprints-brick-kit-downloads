import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { refinementPath, validateRefinementPointer, validateRefinementStudy } from '../assets/mona-refinement-data.js';

const root = new URL('../', import.meta.url);
const pointer = validateRefinementPointer(JSON.parse(await readFile(new URL('archive/mona-refinement.json', root), 'utf8')));
if (pointer.state === 'INPUT_WAIT') {
  console.log('Mona refinement: INPUT_WAIT; no new candidate images or quantities are published.');
} else {
  const bytes = await readFile(new URL(refinementPath(pointer.data_url).slice(1), root));
  if (createHash('sha256').update(bytes).digest('hex') !== pointer.data_sha256) throw new Error('Mona refinement summary hash mismatch');
  const study = validateRefinementStudy(JSON.parse(bytes), pointer);
  console.log(JSON.stringify({
    study_id: study.study_id,
    rows: study.rows.map((row) => ({ role: row.role, candidate_id: row.candidate_id, ...row.metrics })),
    selection: study.selection, visual_approval: study.visual_approval,
    current_revision_unchanged: study.current_revision_unchanged, previous_study_unchanged: study.previous_study_unchanged,
  }, null, 2));
}
