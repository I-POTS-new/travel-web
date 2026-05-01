/* ============ Store 层：统一 localStorage 读写 ============
 * 数据分三大类：
 *  1. plans  : 5 个方案的时间轴（可编辑每行的时间/活动/备注，可增删）
 *  2. todos  : 多分组的清单（出发前/5.3/5.4/回程后，可自定义分组）
 *  3. places : 地图点位（可增删，按分组过滤）
 * localStorage key 统一前缀：jsdata-
 */

const STORE = (() => {
  const PREFIX = 'jsdata-v2-';
  const key = (k) => PREFIX + k;

  function load(k, fallback) {
    try {
      const raw = localStorage.getItem(key(k));
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function save(k, v) {
    localStorage.setItem(key(k), JSON.stringify(v));
  }
  function remove(k) { localStorage.removeItem(key(k)); }

  // 数据 getter：存在用 localStorage，否则返回默认
  const plans = () => load('plans', structuredClone(DEFAULT_PLANS));
  const todos = () => load('todos', structuredClone(DEFAULT_TODOS));
  const places = () => load('places', structuredClone(DEFAULT_PLACES));
  const todoState = () => load('todoState', {});

  return {
    plans, todos, places, todoState,
    savePlans: (v) => save('plans', v),
    saveTodos: (v) => save('todos', v),
    savePlaces: (v) => save('places', v),
    saveTodoState: (v) => save('todoState', v),
    reset(type) {
      if (type === 'plans') remove('plans');
      else if (type === 'todos') { remove('todos'); remove('todoState'); }
      else if (type === 'places') remove('places');
      else if (type === 'all') ['plans','todos','todoState','places'].forEach(remove);
    }
  };
})();

/* 生成唯一 ID */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
