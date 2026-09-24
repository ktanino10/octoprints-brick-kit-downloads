import catalog from './translations.js';

export const CHARACTER_NAMES = Object.freeze({ ...catalog.characterNames });

export function characterDisplayText(value) {
  return String(value).replace(
    /(^|[^A-Za-z0-9_./?=&%#-])(?:(?:Rubber|RUBBER)[ \t]+)?(?:Ducky|DUCKY)(?![A-Za-z0-9_/-]|\.(?:FCStd|stl|step|3mf|blend|png|jpg|mp4|json|gz|zip)\b)/g,
    (_, prefix) => prefix + CHARACTER_NAMES.ducky,
  );
}
