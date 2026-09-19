const root = new URL('../../', import.meta.url);

export function publicURL(path) {
  const url = new URL(path.replace(/^\/+/, ''), root);
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname)) {
    throw new Error('公開アーカイブ外の参照先は読み込めません。');
  }
  return url.href;
}
