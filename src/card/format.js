/** Small formatting helpers. */
export class Formatting {
  _pad(n) { return String(Math.round(n)).padStart(2, '0'); }
  _formatCountdown(sec) {
    if (sec == null || sec < 0) return '';
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm';
    return '<1m';
  }
  _formatGrams(g) {
    if (g === '-' || g === undefined || g === null) return { val: '-', unit: 'g' };
    var n = parseFloat(g);
    if (isNaN(n)) return { val: g, unit: 'g' };
    if (n >= 1000) return { val: (n / 1000).toFixed(1), unit: 'kg' };
    return { val: String(Math.round(n)), unit: 'g' };
  }
}
