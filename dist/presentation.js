// Shared by the inspector and calculator. Keep the bit index global across octets.
export function binaryAddress(value, prefix) {
  const octets = [24, 16, 8, 0].map(shift => Math.floor(value / 2 ** shift) % 256);
  const groups = octets.map((decimal, octet) => {
    const bits = decimal.toString(2).padStart(8, '0');
    const nibble = offset => `<span class="nibble">${bits.slice(offset, offset + 4).split('').map((bit, i) => `<span class="bit ${octet * 8 + offset + i >= prefix ? 'host' : ''}">${bit}</span>`).join('')}</span>`;
    return `<span class="octet"><span class="octet-bits">${nibble(0)}${nibble(4)}</span><span class="octet-decimal">${decimal}</span></span>`;
  });
  return `<div class="binary-address" role="img" aria-label="${octets.join('.')}, binary ${octets.map(n => n.toString(2).padStart(8,'0')).join('.')}; first ${prefix} network bits, last ${32-prefix} host bits"><div class="binary-octets" aria-hidden="true">${groups.join('<span class="octet-dot">.</span>')}</div><div class="sub binary-caption">Decimal value below each 8-bit octet · two 4-bit groups per octet</div></div>`;
}
export const TAB_IDS = ['explore', 'calculate', 'practice', 'guide'];
export function deploymentConfig(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('App config must be an object.');
  if (raw.version !== undefined && raw.version !== 1) throw Error('Unsupported app config version.');
  for (const key of Object.keys(raw)) if (!['version', 'tabs', 'components'].includes(key)) throw Error(`Unknown app config key: ${key}`);
  const normalize = (input, keys, label) => {
    if (input !== undefined && (!input || typeof input !== 'object' || Array.isArray(input))) throw Error(`${label} must be an object.`);
    for (const [key, value] of Object.entries(input || {})) {
      if (!keys.includes(key) || typeof value !== 'boolean') throw Error(`Invalid ${label} flag: ${key}`);
    }
    return Object.fromEntries(keys.map(key => [key, input?.[key] ?? true]));
  };
  return {version: 1, tabs: normalize(raw.tabs, TAB_IDS, 'tabs'), components: normalize(raw.components, ['importPlan', 'exportPlan'], 'components')};
}
export function enabledTab(config, requested) {
  return config.tabs[requested] ? requested : TAB_IDS.find(id => config.tabs[id]) ?? null;
}
