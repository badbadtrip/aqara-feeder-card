/** Small formatting helpers. */
export class Formatting {
  _displayState(state, labels) {
    if (state === 'unavailable') return 'Недоступно';
    if (state === 'unknown') return 'Неизвестно';
    return labels && Object.prototype.hasOwnProperty.call(labels, state) ? labels[state] : state;
  }
  _pad(n) { return String(Math.round(n)).padStart(2, '0'); }
  _formatCountdown(sec) {
    if (sec == null || sec < 0) return '';
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    if (h > 0) return h + ' ч ' + m + ' мин';
    if (m > 0) return m + ' мин';
    return 'менее 1 мин';
  }
  _formatGrams(g) {
    if (g === '-' || g === undefined || g === null) return { val: '-', unit: 'г' };
    var n = parseFloat(g);
    if (isNaN(n)) return { val: g, unit: 'г' };
    if (n >= 1000) return { val: (n / 1000).toFixed(1).replace('.', ','), unit: 'кг' };
    return { val: String(Math.round(n)), unit: 'г' };
  }
}
