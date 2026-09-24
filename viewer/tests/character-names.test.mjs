import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_NAMES, characterDisplayText } from '../../assets/character-names.js';
import { translate } from '../../assets/i18n.js';

test('the exact character display name is canonical and idempotent in both languages', () => {
  assert.equal(CHARACTER_NAMES.ducky, 'Rubber Ducky');
  for (const source of ['Ducky', 'DUCKY', 'Rubber Ducky', 'RUBBER DUCKY']) {
    assert.equal(characterDisplayText(source), 'Rubber Ducky');
    assert.equal(characterDisplayText(characterDisplayText(source)), 'Rubber Ducky');
  }
  assert.equal(translate('Ducky / 4 mm', 'en'), 'Rubber Ducky / 4 mm');
  assert.equal(translate('Ducky', 'ja'), 'Rubber Ducky');
  assert.equal(characterDisplayText('Mona・Copilot・Ducky'), 'Mona・Copilot・Rubber Ducky');
});

test('display correction does not rewrite part IDs, case slugs, URLs or file names', () => {
  for (const identifier of ['ducky', 'ducky-p120', 'DUCKY-P120-001', 'Ducky.FCStd', 'Ducky.stl',
    'artifacts/Ducky/manifest.json', 'https://github.com/example/Ducky', 'case=Ducky', 'Rubber Ducky']) {
    assert.equal(characterDisplayText(identifier), identifier);
  }
  assert.equal(characterDisplayText('Rubber Ducky / DUCKY-P200-008384'), 'Rubber Ducky / DUCKY-P200-008384');
});
