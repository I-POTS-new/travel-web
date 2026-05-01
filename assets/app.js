/* ==========================================================
 * 交互式旅行攻略 · app.js
 * 功能：时间轴编辑 / Todo 分组编辑 / 地图编辑 / 路线规划
 * ========================================================== */

/* ===== 通用模态框 ===== */
const Modal = (() => {
  const el = document.getElementById('modal');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const confirmBtn = document.getElementById('modalConfirm');
  const cancelBtn = document.getElementById('modalCancel');
  const closeBtn = document.getElementById('modalClose');
  let onConfirm = null;

  const hide = () => { el.classList.add('hidden'); onConfirm = null; };
  closeBtn.addEventListener('click', hide);
  cancelBtn.addEventListener('click', hide);
  el.addEventListener('click', e => { if (e.target === el) hide(); });

  confirmBtn.addEventListener('click', () => {
    if (onConfirm) {
      const ok = onConfirm();
      if (ok !== false) hide();
    } else hide();
  });

  return {
    open({ title, html, onConfirm: cb, confirmText = '保存' }) {
      titleEl.textContent = title;
      bodyEl.innerHTML = html;
      confirmBtn.textContent = confirmText;
      onConfirm = cb;
      el.classList.remove('hidden');
      // 自动聚焦第一个输入框
      setTimeout(() => {
        const input = bodyEl.querySelector('input, textarea, select');
        if (input) input.focus();
      }, 50);
    },
    hide,
    getValue: (id) => (bodyEl.querySelector('#' + id) || {}).value || ''
  };
})();

/* ===== Toast 轻提示 ===== */
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);
    background:${type==='error'?'#DC2626':'#1F4E79'};color:#fff;padding:8px 18px;
    border-radius:8px;font-size:14px;z-index:300;box-shadow:0 4px 12px rgba(0,0,0,.2);
    animation:fadeIn .2s;`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 1800);
  setTimeout(() => el.remove(), 2200);
}

/* =================================================================
 * 模块 1：时间轴（可编辑）
 * ================================================================= */
const Timeline = (() => {
  let currentPlan = 'A';

  function getPlans() { return STORE.plans(); }
  function savePlans(p) { STORE.savePlans(p); }

  function render() {
    const plans = getPlans();
    const plan = plans[currentPlan];
    const container = document.getElementById('planContent');

    const renderItem = (dayKey, it) => `
      <li class="tl-item" data-day="${dayKey}" data-id="${it.id}">
        <div class="tl-item-body">
          <div class="tl-time">${escapeHtml(it.time)}</div>
          <div class="tl-act">${escapeHtml(it.act)}</div>
          ${it.note ? `<div class="tl-note">${escapeHtml(it.note)}</div>` : ''}
        </div>
        <button class="tl-menu-btn" data-act="menu" title="更多操作" aria-label="更多操作">
          <i data-lucide="more-vertical" class="w-4 h-4"></i>
        </button>
      </li>`;

    const renderDay = (dayKey) => {
      const day = plan[dayKey];
      return `
        <div class="card p-5">
          <div class="flex items-center justify-between gap-2 mb-1">
            <div class="flex items-center gap-2 cursor-pointer flex-1" data-edit-day="${dayKey}">
              <i data-lucide="calendar-days" class="w-5 h-5 text-[color:var(--brand-2)]"></i>
              <h3 class="font-bold text-lg">${escapeHtml(day.date)}</h3>
              <i data-lucide="pencil" class="w-3.5 h-3.5 text-slate-400 opacity-0 hover:opacity-100 transition"></i>
            </div>
          </div>
          ${day.subtitle ? `<p class="text-sm text-slate-500 mb-4">${escapeHtml(day.subtitle)}</p>` : '<div class="mb-4"></div>'}
          <ul class="tl">${day.items.map(it => renderItem(dayKey, it)).join('')}</ul>
          <button class="tl-add-btn" data-add="${dayKey}">
            <i data-lucide="plus-circle" class="w-4 h-4"></i><span>新增时间点</span>
          </button>
        </div>`;
    };

    container.innerHTML = `
      <div class="md:col-span-2 mb-2">
        <h3 class="text-xl font-bold text-[color:var(--brand)]">${escapeHtml(plan.title)}</h3>
        <p class="text-sm text-slate-500">${escapeHtml(plan.tag)}</p>
      </div>
      ${renderDay('day1')}
      ${renderDay('day2')}
    `;

    // 绑定事件
    container.querySelectorAll('.tl-item').forEach(li => {
      const dayKey = li.dataset.day;
      const itemId = li.dataset.id;
      // 主体点击 → 编辑
      li.querySelector('.tl-item-body').addEventListener('click', (e) => {
        e.stopPropagation();
        editItem(dayKey, itemId);
      });
      // 三点菜单按钮 → 弹出操作菜单
      li.querySelector('.tl-menu-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showItemMenu(e.currentTarget, dayKey, itemId);
      });
    });

    container.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => addItem(btn.dataset.add));
    });

    container.querySelectorAll('[data-edit-day]').forEach(h => {
      h.addEventListener('click', () => editDayHeader(h.dataset.editDay));
    });

    lucide.createIcons();
  }

  /* 弹出上下文菜单：上移 / 下移 / 编辑 / 删除 */
  function showItemMenu(anchorBtn, dayKey, itemId) {
    // 若已有菜单则关闭
    document.querySelectorAll('.tl-ctx-menu').forEach(m => m.remove());

    const plans = getPlans();
    const items = plans[currentPlan][dayKey].items;
    const idx = items.findIndex(i => i.id === itemId);
    const canUp = idx > 0;
    const canDown = idx < items.length - 1;

    const menu = document.createElement('div');
    menu.className = 'tl-ctx-menu';
    menu.innerHTML = `
      <button data-ctx="edit"><i data-lucide="pencil" class="w-4 h-4"></i>编辑</button>
      <button data-ctx="up" ${canUp ? '' : 'disabled'}><i data-lucide="arrow-up" class="w-4 h-4"></i>上移</button>
      <button data-ctx="down" ${canDown ? '' : 'disabled'}><i data-lucide="arrow-down" class="w-4 h-4"></i>下移</button>
      <button data-ctx="delete" class="danger"><i data-lucide="trash-2" class="w-4 h-4"></i>删除</button>
    `;
    document.body.appendChild(menu);
    // 定位：按钮右下方
    const rect = anchorBtn.getBoundingClientRect();
    menu.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    menu.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 160) + 'px';

    lucide.createIcons();

    menu.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = b.dataset.ctx;
        menu.remove();
        if (action === 'edit') editItem(dayKey, itemId);
        else if (action === 'delete') deleteItem(dayKey, itemId);
        else if (action === 'up') moveItem(dayKey, itemId, -1);
        else if (action === 'down') moveItem(dayKey, itemId, 1);
      });
    });

    // 点外面关闭
    const close = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => document.addEventListener('click', close), 0);
  }

  function editItem(dayKey, itemId) {
    const plans = getPlans();
    const items = plans[currentPlan][dayKey].items;
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    Modal.open({
      title: '✏️ 编辑时间点',
      html: `
        <label>时间</label><input id="t_time" value="${escapeHtml(item.time)}" placeholder="如 08:00 或 08:00–10:00">
        <label>活动内容</label><input id="t_act" value="${escapeHtml(item.act)}">
        <label>备注 / 交通</label><textarea id="t_note">${escapeHtml(item.note)}</textarea>
        <div class="modal-shortcut">
          <button type="button" class="shortcut-btn" data-del-inline>
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>删除这一项
          </button>
        </div>
      `,
      onConfirm: () => {
        item.time = Modal.getValue('t_time').trim() || '未定';
        item.act = Modal.getValue('t_act').trim() || '(无)';
        item.note = Modal.getValue('t_note').trim();
        savePlans(plans);
        render();
        toast('已保存');
      }
    });
    // 绑定模态框内的删除快捷操作
    setTimeout(() => {
      const delBtn = document.querySelector('[data-del-inline]');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          if (confirm('确认删除这一项？')) {
            Modal.hide();
            deleteItem(dayKey, itemId);
          }
        });
      }
    }, 80);
  }

  function addItem(dayKey) {
    Modal.open({
      title: '➕ 新增时间点',
      html: `
        <label>时间</label><input id="t_time" placeholder="如 09:00–11:00">
        <label>活动内容</label><input id="t_act" placeholder="做什么">
        <label>备注 / 交通</label><textarea id="t_note" placeholder="可留空"></textarea>
      `,
      onConfirm: () => {
        const time = Modal.getValue('t_time').trim();
        const act = Modal.getValue('t_act').trim();
        if (!time || !act) { toast('时间和活动不能为空', 'error'); return false; }
        const plans = getPlans();
        plans[currentPlan][dayKey].items.push({
          id: uid(), time, act, note: Modal.getValue('t_note').trim()
        });
        savePlans(plans);
        render();
        toast('已添加');
      }
    });
  }

  function deleteItem(dayKey, itemId) {
    if (!confirm('确认删除这一项？')) return;
    const plans = getPlans();
    plans[currentPlan][dayKey].items = plans[currentPlan][dayKey].items.filter(i => i.id !== itemId);
    savePlans(plans);
    render();
    toast('已删除');
  }

  function moveItem(dayKey, itemId, dir) {
    const plans = getPlans();
    const items = plans[currentPlan][dayKey].items;
    const idx = items.findIndex(i => i.id === itemId);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
    savePlans(plans);
    render();
    if (navigator.vibrate) navigator.vibrate(10);
  }

  function editDayHeader(dayKey) {
    const plans = getPlans();
    const day = plans[currentPlan][dayKey];
    Modal.open({
      title: '📅 编辑日期标题',
      html: `
        <label>日期标题</label><input id="d_date" value="${escapeHtml(day.date)}">
        <label>副标题 / 主题</label><input id="d_sub" value="${escapeHtml(day.subtitle || '')}">
      `,
      onConfirm: () => {
        day.date = Modal.getValue('d_date').trim() || day.date;
        day.subtitle = Modal.getValue('d_sub').trim();
        savePlans(plans);
        render();
      }
    });
  }

  function init() {
    document.querySelectorAll('#planTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#planTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPlan = btn.dataset.plan;
        render();
      });
    });

    document.getElementById('timelineResetBtn').addEventListener('click', () => {
      if (confirm('重置当前方案的所有时间点到默认？')) {
        STORE.reset('plans');
        render();
        toast('已重置');
      }
    });

    render();
  }

  return { init, render, editItem, addItem, deleteItem, editDayHeader };
})();

/* ===== HTML 转义 ===== */
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* ===== 把 #RRGGBB / #RGB 颜色转为 rgba(…, alpha) ===== */
function hexWithAlpha(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(46,150,135,${alpha})`;
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

Timeline.init();

/* =================================================================
 * 模块 2：TodoList（分组 + 编辑）
 * ================================================================= */
const Todo = (() => {
  let currentGroupId = null;

  const GROUP_COLORS = {
    blue: '#2563EB', green: '#16A34A', orange: '#EA580C',
    purple: '#9333EA', red: '#DC2626', cyan: '#0891B2'
  };

  function getData() { return STORE.todos(); }
  function getState() { return STORE.todoState(); }
  function save(d) { STORE.saveTodos(d); }
  function saveState(s) { STORE.saveTodoState(s); }

  function renderGroupTabs() {
    const data = getData();
    const state = getState();
    if (!currentGroupId || !data.groups.some(g => g.id === currentGroupId)) {
      currentGroupId = data.groups[0]?.id;
    }
    const container = document.getElementById('todoGroupTabs');
    container.innerHTML = data.groups.map(g => {
      const count = data.items.filter(it => it.groupId === g.id).length;
      const done = data.items.filter(it => it.groupId === g.id && state[it.id]).length;
      const color = GROUP_COLORS[g.color] || '#2E75B6';
      const active = g.id === currentGroupId;
      return `
        <div class="group-tab ${active ? 'active' : ''}" data-gid="${g.id}">
          <span class="group-dot" style="background:${color}"></span>
          <span>${escapeHtml(g.name)}</span>
          <span class="group-count">${done}/${count}</span>
        </div>`;
    }).join('');

    container.querySelectorAll('.group-tab').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.group-manage')) return;
        currentGroupId = el.dataset.gid;
        renderGroupTabs();
        renderList();
      });
    });
  }

  function renderList() {
    const data = getData();
    const state = getState();
    const listEl = document.getElementById('todoList');
    const items = data.items.filter(it => it.groupId === currentGroupId);

    if (items.length === 0) {
      listEl.innerHTML = `<li class="text-center text-slate-400 py-8 text-sm">该分组还没有项目，点"新增一项"开始 →</li>`;
    } else {
      listEl.innerHTML = items.map(it => `
        <li class="todo-item ${state[it.id] ? 'done' : ''} flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" data-id="${it.id}">
          <input type="checkbox" class="todo-checkbox mt-1" ${state[it.id] ? 'checked' : ''}>
          <div class="flex-1 min-w-0">
            <span class="todo-text text-sm">${escapeHtml(it.text)}</span>
            ${it.link ? `<a href="${escapeHtml(it.link)}" target="_blank" class="ml-2 text-xs text-[color:var(--brand-2)] hover:underline inline-flex items-center gap-1">前往<i data-lucide="external-link" class="w-3 h-3"></i></a>` : ''}
          </div>
          <div class="todo-edit-actions">
            <button class="icon-btn" title="编辑"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
            <button class="icon-btn danger" title="删除"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
          </div>
        </li>`).join('');
    }

    // 绑定事件
    listEl.querySelectorAll('.todo-item').forEach(li => {
      const id = li.dataset.id;
      li.querySelector('.todo-checkbox').addEventListener('change', (e) => {
        const s = getState();
        s[id] = e.target.checked;
        saveState(s);
        li.classList.toggle('done', e.target.checked);
        updateProgress();
        renderGroupTabs();
      });
      const [editBtn, delBtn] = li.querySelectorAll('.icon-btn');
      editBtn.addEventListener('click', () => editItem(id));
      delBtn.addEventListener('click', () => deleteItem(id));
    });

    lucide.createIcons();
    updateProgress();
  }

  function updateProgress() {
    const data = getData();
    const state = getState();
    const current = data.items.filter(it => it.groupId === currentGroupId);
    const curDone = current.filter(it => state[it.id]).length;
    document.getElementById('groupProgress').textContent = `${curDone}/${current.length}`;
    const total = data.items.length;
    const done = data.items.filter(it => state[it.id]).length;
    document.getElementById('totalProgress').textContent = total ? Math.round(done/total*100) + '%' : '0%';
  }

  function addItem() {
    Modal.open({
      title: '新增清单项',
      html: `
        <label>内容</label><input id="n_text" placeholder="要做什么">
        <label>链接（选填）</label><input id="n_link" placeholder="https://...">
      `,
      onConfirm: () => {
        const text = Modal.getValue('n_text').trim();
        if (!text) { toast('内容不能为空', 'error'); return false; }
        const data = getData();
        data.items.push({
          id: uid(), groupId: currentGroupId, text,
          link: Modal.getValue('n_link').trim() || undefined
        });
        save(data);
        renderList();
        renderGroupTabs();
        toast('已添加');
      }
    });
  }

  function editItem(id) {
    const data = getData();
    const item = data.items.find(i => i.id === id);
    if (!item) return;
    Modal.open({
      title: '编辑清单项',
      html: `
        <label>内容</label><input id="n_text" value="${escapeHtml(item.text)}">
        <label>链接（选填）</label><input id="n_link" value="${escapeHtml(item.link || '')}">
        <label>所属分组</label>
        <select id="n_group">
          ${data.groups.map(g => `<option value="${g.id}" ${g.id === item.groupId ? 'selected' : ''}>${escapeHtml(g.name)}</option>`).join('')}
        </select>
      `,
      onConfirm: () => {
        item.text = Modal.getValue('n_text').trim() || item.text;
        item.link = Modal.getValue('n_link').trim() || undefined;
        item.groupId = Modal.getValue('n_group');
        save(data);
        renderList();
        renderGroupTabs();
      }
    });
  }

  function deleteItem(id) {
    if (!confirm('删除这一项？')) return;
    const data = getData();
    data.items = data.items.filter(i => i.id !== id);
    save(data);
    const state = getState();
    delete state[id];
    saveState(state);
    renderList();
    renderGroupTabs();
  }

  function addGroup() {
    Modal.open({
      title: '新增分组',
      html: `
        <label>分组名称</label><input id="g_name" placeholder="如：5.5 返程">
        <label>颜色</label>
        <select id="g_color">
          <option value="blue">蓝</option><option value="green">绿</option>
          <option value="orange">橙</option><option value="purple">紫</option>
          <option value="red">红</option><option value="cyan">青</option>
        </select>
      `,
      onConfirm: () => {
        const name = Modal.getValue('g_name').trim();
        if (!name) { toast('名称不能为空', 'error'); return false; }
        const data = getData();
        data.groups.push({ id: uid(), name, color: Modal.getValue('g_color') });
        save(data);
        renderGroupTabs();
      }
    });
  }

  function init() {
    document.getElementById('addTodoBtn').addEventListener('click', addItem);
    document.getElementById('addGroupBtn').addEventListener('click', addGroup);
    document.getElementById('resetTodoBtn').addEventListener('click', () => {
      if (confirm('重置所有清单和分组到默认？已勾选项也会清空。')) {
        STORE.reset('todos');
        currentGroupId = null;
        renderGroupTabs();
        renderList();
        toast('已重置');
      }
    });
    renderGroupTabs();
    renderList();
  }

  return { init };
})();
Todo.init();

/* =================================================================
 * 模块 3：地图（可编辑 + 分组 + 路线）
 * ================================================================= */
const MapModule = (() => {
  const TYPE_ICON = { hotel: '🏨', station: '🚄', spot: '📍', food: '🍽️' };
  let map, markers = {}, activeGroupIds = new Set(), routeLayer = null, addingMode = false;

  function getData() { return STORE.places(); }
  function save(d) { STORE.savePlaces(d); }

  function initMap() {
    map = L.map('map', { zoomControl: true, attributionControl: false }).setView([34.0, 119.15], 8);
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      subdomains: '1234', attribution: '&copy; 高德地图', maxZoom: 18
    }).addTo(map);

    // 点击地图添加点位
    map.on('click', (e) => {
      if (!addingMode) return;
      addPlaceAt(e.latlng.lat, e.latlng.lng);
    });
  }

  function makeMarker(p) {
    const data = getData();
    const group = data.groups.find(g => g.id === p.groupId);
    const color = group ? group.color : '#64748B';
    const icon = TYPE_ICON[p.type] || '📍';
    const html = `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.35);border:2.5px solid #fff;"><span style="transform:rotate(45deg);font-size:16px;">${icon}</span></div>`;
    const divIcon = L.divIcon({ html, className: '', iconSize: [34, 34], iconAnchor: [17, 34], popupAnchor: [0, -34] });
    const m = L.marker([p.lat, p.lng], { icon: divIcon });
    const navUrl = `https://uri.amap.com/marker?position=${p.lng},${p.lat}&name=${encodeURIComponent(p.name)}`;
    m.bindPopup(`
      <div style="padding:4px 2px;">
        <b style="font-size:15px;">${escapeHtml(p.name)}</b><br>
        <span style="color:#666;font-size:12.5px;line-height:1.5;">${escapeHtml(p.city)} · ${escapeHtml(p.desc || '')}</span>
        <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <a href="javascript:void(0)" onclick="MapModule.setRouteEndpoint('from','${p.id}')" class="route-quick-btn">
            <span>📍</span><span>设为起点</span>
          </a>
          <a href="javascript:void(0)" onclick="MapModule.setRouteEndpoint('to','${p.id}')" class="route-quick-btn to">
            <span>🎯</span><span>设为终点</span>
          </a>
        </div>
        <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
          <a href="${navUrl}" target="_blank" class="popup-btn" style="background:#1B5E57;color:#fff;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 4px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">
            <span>🧭</span><span>导航</span>
          </a>
          <a href="javascript:void(0)" onclick="MapModule.editPlace('${p.id}')" class="popup-btn" style="background:#FDF2E6;color:#D2691E;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 4px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">
            <span>✏️</span><span>编辑</span>
          </a>
          <a href="javascript:void(0)" onclick="MapModule.deletePlace('${p.id}')" class="popup-btn" style="background:#FDD8D8;color:#C92A2A;display:flex;align-items:center;justify-content:center;gap:4px;padding:8px 4px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">
            <span>🗑️</span><span>删除</span>
          </a>
        </div>
      </div>
    `, { maxWidth: 300, minWidth: 240 });
    return m;
  }

  function renderMarkers() {
    // 清除已有 marker
    Object.values(markers).forEach(m => map.removeLayer(m));
    markers = {};
    const data = getData();
    data.items.forEach(p => {
      if (!activeGroupIds.has(p.groupId)) return;
      const m = makeMarker(p);
      m.addTo(map);
      markers[p.id] = m;
    });
  }

  function renderGroupFilter() {
    const data = getData();
    if (activeGroupIds.size === 0) {
      data.groups.forEach(g => activeGroupIds.add(g.id));
    }
    const container = document.getElementById('mapGroupFilter');
    const allActive = data.groups.every(g => activeGroupIds.has(g.id));
    const noneActive = activeGroupIds.size === 0;

    container.innerHTML = `
      <div class="filter-actions">
        <button data-all-op="toggle" title="全选 / 全不选">
          <i data-lucide="${allActive ? 'check-square-2' : (noneActive ? 'square' : 'minus-square')}" class="w-3.5 h-3.5"></i>
          ${allActive ? '全不选' : '全选'}
        </button>
      </div>
      ${data.groups.map(g => {
        const count = data.items.filter(it => it.groupId === g.id).length;
        const active = activeGroupIds.has(g.id);
        return `
          <div class="filter-chip ${active ? 'active' : ''}" data-gid="${g.id}"
               style="${active ? `background:${g.color};border-color:${g.color}` : ''}">
            <span class="chip-check"></span>
            <span class="chip-dot" style="background:${g.color}"></span>
            <span>${escapeHtml(g.name)}</span>
            <span class="chip-count">${count}</span>
            <button class="chip-solo" data-solo="${g.id}" title="只看这个分组" style="background:transparent;border:none;padding:0 0 0 4px;cursor:pointer;color:inherit;opacity:.7">
              <i data-lucide="focus" class="w-3 h-3"></i>
            </button>
          </div>`;
      }).join('')}
    `;

    container.querySelectorAll('.filter-chip').forEach(el => {
      el.addEventListener('click', (e) => {
        const soloBtn = e.target.closest('[data-solo]');
        if (soloBtn) {
          // 单独查看：只激活这一个
          const gid = soloBtn.dataset.solo;
          const isSolo = activeGroupIds.size === 1 && activeGroupIds.has(gid);
          activeGroupIds.clear();
          if (!isSolo) activeGroupIds.add(gid);
          else data.groups.forEach(g => activeGroupIds.add(g.id));
          e.stopPropagation();
        } else {
          const gid = el.dataset.gid;
          if (activeGroupIds.has(gid)) activeGroupIds.delete(gid);
          else activeGroupIds.add(gid);
        }
        renderGroupFilter();
        renderMarkers();
        renderPlaceList();
        updateRouteSelects();
        updateMapInfoBar();
      });
    });

    const allBtn = container.querySelector('[data-all-op]');
    if (allBtn) {
      allBtn.addEventListener('click', () => {
        if (allActive) activeGroupIds.clear();
        else data.groups.forEach(g => activeGroupIds.add(g.id));
        renderGroupFilter();
        renderMarkers();
        renderPlaceList();
        updateRouteSelects();
        updateMapInfoBar();
      });
    }

    lucide.createIcons();
  }

  /* ============ 点位列表（按分组折叠） ============ */
  const FOLD_KEY = 'jiangsu-place-fold';
  function getFoldState() {
    try { return JSON.parse(localStorage.getItem(FOLD_KEY)) || {}; } catch { return {}; }
  }
  function saveFoldState(s) { localStorage.setItem(FOLD_KEY, JSON.stringify(s)); }

  function renderPlaceList() {
    const data = getData();
    const container = document.getElementById('placeList');
    const visiblePlaces = data.items.filter(p => activeGroupIds.has(p.groupId));

    if (visiblePlaces.length === 0) {
      container.innerHTML = `<div class="card p-8 text-center text-slate-400 text-sm">🕳️ 当前筛选条件下无点位<br>试试勾选其他分组</div>`;
      return;
    }

    const foldState = getFoldState();

    // 按分组聚合（只显示激活的分组）
    const groupsWithPlaces = data.groups
      .filter(g => activeGroupIds.has(g.id))
      .map(g => ({
        group: g,
        places: visiblePlaces.filter(p => p.groupId === g.id)
      }))
      .filter(x => x.places.length > 0);

    container.innerHTML = groupsWithPlaces.map(({ group, places }) => {
      // 默认展开（除非 foldState 明确折叠）
      const expanded = foldState[group.id] !== false;
      const softColor = hexWithAlpha(group.color, 0.13);
      const groupStyle = `--group-color:${group.color};--group-color-soft:${softColor}`;
      return `
        <div class="place-group ${expanded ? 'expanded' : ''}" data-gid="${group.id}" style="${groupStyle}">
          <div class="place-group-header" data-toggle>
            <i data-lucide="chevron-right" class="w-4 h-4 place-group-chevron"></i>
            <span class="place-group-indicator"></span>
            <span class="place-group-title">${escapeHtml(group.name)}</span>
            <span class="place-group-count">${places.length} 个</span>
          </div>
          <div class="place-group-body">
            <div class="place-group-body-inner">
              ${places.map(p => {
                const icon = TYPE_ICON[p.type] || '📍';
                const navUrl = `https://uri.amap.com/marker?position=${p.lng},${p.lat}&name=${encodeURIComponent(p.name)}`;
                return `
                  <div class="place-item" data-id="${p.id}">
                    <div class="place-item-icon flyto" style="background:${group.color}">${icon}</div>
                    <div class="place-item-info flyto">
                      <div class="place-item-name">${escapeHtml(p.name)}</div>
                      <div class="place-item-desc">${escapeHtml(p.city)} · ${escapeHtml(p.desc || '')}</div>
                    </div>
                    <div class="place-item-actions">
                      <a href="${navUrl}" target="_blank" class="icon-btn" title="导航"><i data-lucide="navigation" class="w-3.5 h-3.5"></i></a>
                      <button class="icon-btn" title="编辑" data-act="edit"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
                      <button class="icon-btn danger" title="删除" data-act="del"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>
        </div>`;
    }).join('');

    // 折叠/展开事件
    container.querySelectorAll('.place-group').forEach(g => {
      const gid = g.dataset.gid;
      g.querySelector('[data-toggle]').addEventListener('click', () => {
        g.classList.toggle('expanded');
        const s = getFoldState();
        s[gid] = g.classList.contains('expanded');
        saveFoldState(s);
      });
    });

    // 点位事件
    container.querySelectorAll('.place-item').forEach(item => {
      const id = item.dataset.id;
      item.querySelectorAll('.flyto').forEach(el => {
        el.addEventListener('click', () => {
          const p = getData().items.find(i => i.id === id);
          if (!p) return;
          map.flyTo([p.lat, p.lng], 14, { duration: 0.8 });
          setTimeout(() => markers[id]?.openPopup(), 800);
          document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
      item.querySelector('[data-act="edit"]').addEventListener('click', () => editPlace(id));
      item.querySelector('[data-act="del"]').addEventListener('click', () => deletePlace(id));
    });

    lucide.createIcons();
  }

  function placeFormHtml(p = {}) {
    const data = getData();
    return `
      <label>名称</label><input id="p_name" value="${escapeHtml(p.name || '')}" placeholder="如：花果山景区">
      <label>类型</label>
      <select id="p_type">
        <option value="spot" ${p.type === 'spot' ? 'selected' : ''}>📍 景点</option>
        <option value="hotel" ${p.type === 'hotel' ? 'selected' : ''}>🏨 酒店</option>
        <option value="station" ${p.type === 'station' ? 'selected' : ''}>🚄 车站</option>
        <option value="food" ${p.type === 'food' ? 'selected' : ''}>🍽️ 美食</option>
      </select>
      <label>所属分组</label>
      <select id="p_group">
        ${data.groups.map(g => `<option value="${g.id}" ${g.id === p.groupId ? 'selected' : ''}>${escapeHtml(g.name)}</option>`).join('')}
      </select>
      <label>城市</label><input id="p_city" value="${escapeHtml(p.city || '')}" placeholder="连云港 / 淮安">
      <label>描述</label><input id="p_desc" value="${escapeHtml(p.desc || '')}" placeholder="简单一句话">
      <label>经纬度（可不改）</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <input id="p_lat" value="${p.lat ?? ''}" placeholder="纬度 lat">
        <input id="p_lng" value="${p.lng ?? ''}" placeholder="经度 lng">
      </div>
    `;
  }

  function addPlaceAt(lat, lng) {
    Modal.open({
      title: `添加点位（${lat.toFixed(4)}, ${lng.toFixed(4)}）`,
      html: placeFormHtml({ lat: lat.toFixed(5), lng: lng.toFixed(5), groupId: Array.from(activeGroupIds)[0] }),
      onConfirm: () => {
        const name = Modal.getValue('p_name').trim();
        if (!name) { toast('名称必填', 'error'); return false; }
        const data = getData();
        data.items.push({
          id: uid(), name, type: Modal.getValue('p_type'),
          groupId: Modal.getValue('p_group'),
          city: Modal.getValue('p_city').trim(),
          desc: Modal.getValue('p_desc').trim(),
          lat: parseFloat(Modal.getValue('p_lat')) || lat,
          lng: parseFloat(Modal.getValue('p_lng')) || lng
        });
        save(data);
        exitAddingMode();
        refresh();
        toast('点位已添加');
      },
      confirmText: '添加'
    });
  }

  function editPlace(id) {
    const data = getData();
    const p = data.items.find(i => i.id === id);
    if (!p) return;
    // 关闭 popup，避免重叠
    markers[id]?.closePopup();
    Modal.open({
      title: '编辑点位',
      html: placeFormHtml(p),
      onConfirm: () => {
        p.name = Modal.getValue('p_name').trim() || p.name;
        p.type = Modal.getValue('p_type');
        p.groupId = Modal.getValue('p_group');
        p.city = Modal.getValue('p_city').trim();
        p.desc = Modal.getValue('p_desc').trim();
        p.lat = parseFloat(Modal.getValue('p_lat')) || p.lat;
        p.lng = parseFloat(Modal.getValue('p_lng')) || p.lng;
        save(data);
        refresh();
        toast('已保存');
      }
    });
  }

  function deletePlace(id) {
    if (!confirm('确认删除这个点位？')) return;
    const data = getData();
    data.items = data.items.filter(i => i.id !== id);
    save(data);
    refresh();
    toast('已删除');
  }

  function enterAddingMode() {
    addingMode = true;
    document.getElementById('map').classList.add('adding-mode');
    const btn = document.getElementById('mapAddBtn');
    btn.classList.add('btn-primary');
    btn.querySelector('span, i + *') || btn;
  }
  function exitAddingMode() {
    addingMode = false;
    document.getElementById('map').classList.remove('adding-mode');
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') exitAddingMode(); });

  /* ===== 路线规划（OSRM 公共服务） ===== */
  /* ============ 路线规划（卡片式选择器 + OSRM） ============ */
  let routeFromId = null, routeToId = null, routeMode = 'driving';

  function updateRouteSelects() {
    // 新 UI：更新两个卡片显示
    const data = getData();
    const fromName = document.getElementById('routeFromName');
    const toName = document.getElementById('routeToName');

    const updateCard = (id, el, placeholder) => {
      const p = id ? data.items.find(i => i.id === id) : null;
      if (p) {
        el.textContent = `${p.name} · ${p.city}`;
        el.classList.remove('placeholder');
      } else {
        el.textContent = placeholder;
        el.classList.add('placeholder');
      }
    };
    updateCard(routeFromId, fromName, '点击选择起点…');
    updateCard(routeToId, toName, '点击选择终点…');
  }

  function openPlacePicker(endpoint) {
    const data = getData();
    const title = endpoint === 'from' ? '选择起点' : '选择终点';
    const currentId = endpoint === 'from' ? routeFromId : routeToId;

    // 按分组组织，默认全部点位（不受筛选限制，方便快速选择）
    const groupsHtml = data.groups.map(g => {
      const places = data.items.filter(p => p.groupId === g.id);
      if (places.length === 0) return '';
      return `
        <div class="place-picker-group">
          <div class="place-picker-group-title">
            <span style="width:8px;height:8px;border-radius:50%;background:${g.color};display:inline-block;"></span>
            ${escapeHtml(g.name)} (${places.length})
          </div>
          ${places.map(p => {
            const icon = TYPE_ICON[p.type] || '📍';
            const selected = p.id === currentId;
            return `
              <div class="place-picker-item ${selected ? 'selected' : ''}" data-pid="${p.id}" data-name="${escapeHtml(p.name)} ${escapeHtml(p.city)} ${escapeHtml(p.desc || '')}">
                <div class="place-picker-icon" style="background:${g.color};color:#fff">${icon}</div>
                <div class="place-picker-info">
                  <div class="place-picker-name">${escapeHtml(p.name)}</div>
                  <div class="place-picker-desc">${escapeHtml(p.city)} · ${escapeHtml(p.desc || '')}</div>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }).join('');

    Modal.open({
      title,
      html: `
        <div class="place-picker-search">
          <input id="pp_search" placeholder="🔍 搜索名称 / 城市 / 描述…" style="margin-bottom:4px;">
        </div>
        <div class="place-picker-list" id="pp_list">
          ${groupsHtml}
          <div id="pp_empty" class="text-center text-slate-400 text-sm py-6 hidden">没有匹配的点位</div>
        </div>
      `,
      onConfirm: () => {
        // 选择动作已经发生，这里只是关闭
      },
      confirmText: '关闭'
    });

    setTimeout(() => {
      const searchEl = document.getElementById('pp_search');
      const listEl = document.getElementById('pp_list');
      const emptyEl = document.getElementById('pp_empty');

      // 点击选择
      listEl.querySelectorAll('.place-picker-item').forEach(it => {
        it.addEventListener('click', () => {
          const pid = it.dataset.pid;
          if (endpoint === 'from') routeFromId = pid;
          else routeToId = pid;
          if (routeFromId && routeFromId === routeToId) {
            toast('起点和终点不能相同', 'error');
            return;
          }
          updateRouteSelects();
          Modal.hide();
          // 若两端都选好，自动规划
          if (routeFromId && routeToId) {
            setTimeout(planRoute, 150);
          }
        });
      });

      // 搜索
      searchEl.addEventListener('input', () => {
        const q = searchEl.value.trim().toLowerCase();
        let anyVisible = false;
        listEl.querySelectorAll('.place-picker-group').forEach(grp => {
          let groupVisible = false;
          grp.querySelectorAll('.place-picker-item').forEach(it => {
            const text = it.dataset.name.toLowerCase();
            const visible = !q || text.includes(q);
            it.style.display = visible ? '' : 'none';
            if (visible) groupVisible = true;
          });
          grp.style.display = groupVisible ? '' : 'none';
          if (groupVisible) anyVisible = true;
        });
        emptyEl.classList.toggle('hidden', anyVisible);
      });
      searchEl.focus();
    }, 80);
  }

  async function planRoute() {
    if (!routeFromId || !routeToId) { toast('请先选择起点和终点', 'error'); return; }
    if (routeFromId === routeToId) { toast('起点和终点不能相同', 'error'); return; }

    const data = getData();
    const from = data.items.find(i => i.id === routeFromId);
    const to = data.items.find(i => i.id === routeToId);
    if (!from || !to) return;

    clearRoute(false);
    const infoBox = document.getElementById('routeInfo');
    infoBox.classList.remove('hidden');
    infoBox.innerHTML = `<div class="flex items-center gap-2 text-[color:var(--brand)]"><i data-lucide="loader" class="w-4 h-4 animate-spin"></i>正在规划路线…</div>`;
    lucide.createIcons();

    try {
      // OSRM 公共 demo 只可靠支持 driving，统一用它获取真实路径和距离
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const r = await fetch(url);
      const json = await r.json();
      if (!json.routes || !json.routes[0]) throw new Error('无可用路线');
      const route = json.routes[0];
      const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
      routeLayer = L.polyline(coords, {
        color: routeMode === 'walking' ? '#16A34A' : '#2E9687',
        weight: 5, opacity: 0.85, lineCap: 'round', dashArray: routeMode === 'walking' ? '8,6' : null
      }).addTo(map);
      map.fitBounds(routeLayer.getBounds().pad(0.2));

      const km = route.distance / 1000;
      const kmStr = km.toFixed(1);

      // 根据模式自己换算时间（OSRM foot profile 不可用，需本地估算）
      const drivingSpeed = km > 30 ? 65 : 40;  // km/h，远距离按高速
      const walkingSpeed = 4.5;                 // km/h 平均步行
      const drivingMin = Math.round(km / drivingSpeed * 60);
      const walkingMin = Math.round(km / walkingSpeed * 60);

      const fmtTime = (min) => {
        if (min < 60) return `${min} 分钟`;
        const h = Math.floor(min / 60);
        const m = min % 60;
        return m ? `${h} h ${m} min` : `${h} 小时`;
      };
      const drivingStr = fmtTime(drivingMin);
      const walkingStr = walkingMin >= 600
        ? `> 10 小时（不建议）`
        : fmtTime(walkingMin);

      const currentMin = routeMode === 'walking' ? walkingMin : drivingMin;
      const currentStr = routeMode === 'walking' ? walkingStr : drivingStr;
      const modeIcon = routeMode === 'walking' ? '🚶' : '🚗';
      const modeLabel = routeMode === 'walking' ? '步行' : '驾车';

      // 远距离步行时警告
      const warning = routeMode === 'walking' && km > 10
        ? `<div style="background:#FEF3C7;color:#92400E;padding:6px 10px;border-radius:8px;font-size:12px;margin-top:8px;">
             ⚠️ 距离较远，步行耗时长，建议使用驾车或公共交通
           </div>` : '';

      const mode = routeMode === 'walking' ? 'walk' : 'car';
      const navUrl = `https://uri.amap.com/navigation?from=${from.lng},${from.lat},${encodeURIComponent(from.name)}&to=${to.lng},${to.lat},${encodeURIComponent(to.name)}&mode=${mode}&policy=1&src=trip&coordinate=gaode&callnative=1`;

      infoBox.innerHTML = `
        <div class="route-info-box">
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-[color:var(--brand)] text-sm mb-1.5 truncate">
              ${escapeHtml(from.name)} → ${escapeHtml(to.name)}
            </div>
            <div class="flex gap-2 flex-wrap items-center text-xs">
              <span style="background:rgba(255,255,255,.5);padding:3px 10px;border-radius:999px;">
                📏 <b>${kmStr} km</b>
              </span>
              <span style="background:${routeMode==='driving'?'#2E9687':'transparent'};color:${routeMode==='driving'?'#fff':'var(--ink-soft)'};padding:3px 10px;border-radius:999px;font-weight:${routeMode==='driving'?'600':'normal'};">
                🚗 ${drivingStr}
              </span>
              <span style="background:${routeMode==='walking'?'#16A34A':'transparent'};color:${routeMode==='walking'?'#fff':'var(--ink-soft)'};padding:3px 10px;border-radius:999px;font-weight:${routeMode==='walking'?'600':'normal'};">
                🚶 ${walkingStr}
              </span>
            </div>
            ${warning}
          </div>
          <a href="${navUrl}" target="_blank" class="btn btn-primary text-xs whitespace-nowrap" style="align-self:flex-start;">
            <i data-lucide="navigation" class="w-3.5 h-3.5"></i>高德导航
          </a>
        </div>
      `;
      lucide.createIcons();
    } catch (e) {
      infoBox.innerHTML = `<span class="text-red-500 text-sm">❌ 路线规划失败：${e.message}</span>`;
    }
  }

  function clearRoute(resetSelection = true) {
    if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null; }
    document.getElementById('routeInfo').classList.add('hidden');
    if (resetSelection) {
      routeFromId = null;
      routeToId = null;
      updateRouteSelects();
    }
  }

  function setRouteEndpoint(endpoint, pid) {
    // 从地图 popup 快速设置起点/终点
    if (endpoint === 'from') {
      if (pid === routeToId) { toast('该点已是终点，无法设为起点', 'error'); return; }
      routeFromId = pid;
      toast('已设为起点 A 📍');
    } else {
      if (pid === routeFromId) { toast('该点已是起点，无法设为终点', 'error'); return; }
      routeToId = pid;
      toast('已设为终点 B 🎯');
    }
    updateRouteSelects();
    // 关闭 popup
    markers[pid]?.closePopup();
    // 滚动到路线面板
    document.getElementById('routePanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    // 两端都有则自动规划
    if (routeFromId && routeToId) {
      setTimeout(planRoute, 400);
    }
  }

  function swapRoute() {
    const tmp = routeFromId;
    routeFromId = routeToId;
    routeToId = tmp;
    updateRouteSelects();
    if (navigator.vibrate) navigator.vibrate(15);
    if (routeFromId && routeToId) setTimeout(planRoute, 200);
  }

  /* ============ 地名搜索（Nominatim / OSM） ============ */
  let searchMarker = null;
  let searchTimer = null;
  let searchAbortCtrl = null;

  const TYPE_ICON_FOR_OSM = {
    hotel: '🏨', guest_house: '🏨', motel: '🏨',
    restaurant: '🍽️', cafe: '☕', fast_food: '🍔', food_court: '🍽️', bar: '🍺',
    station: '🚄', train_station: '🚄', bus_station: '🚌', subway_entrance: '🚇',
    attraction: '🎡', museum: '🏛️', park: '🌳', viewpoint: '🏞️',
    hospital: '🏥', school: '🏫',
    supermarket: '🛒', shop: '🛍️',
    university: '🎓', place_of_worship: '⛩️',
    default: '📍'
  };
  function iconForOSM(type, category) {
    return TYPE_ICON_FOR_OSM[type] || TYPE_ICON_FOR_OSM[category] || TYPE_ICON_FOR_OSM.default;
  }
  /* OSM 类别 → 我们自定义的 type */
  function osmToOurType(type, category) {
    if (category === 'tourism' || ['attraction','viewpoint','museum','park'].includes(type)) return 'spot';
    if (['hotel','guest_house','motel','hostel'].includes(type)) return 'hotel';
    if (['restaurant','cafe','fast_food','food_court','bar'].includes(type)) return 'food';
    if (['train_station','bus_station','subway_entrance','airport'].includes(type) || category === 'railway') return 'station';
    return 'spot';
  }

  async function searchPlaces(query) {
    // 取消上一次请求
    if (searchAbortCtrl) searchAbortCtrl.abort();
    searchAbortCtrl = new AbortController();

    const resultsEl = document.getElementById('mapSearchResults');
    resultsEl.classList.add('show');
    resultsEl.innerHTML = `<div class="map-search-loading">🔍 正在搜索…</div>`;

    // 依次尝试多个数据源（国内优先），任一成功即返回
    const providers = [
      { name: '高德', fn: searchViaAmap },
      { name: 'OSM',  fn: searchViaNominatim }
    ];

    let lastErr = null;
    for (const p of providers) {
      try {
        const list = await p.fn(query);
        if (list && list.length) {
          renderSearchResults(query, list);
          return;
        }
        // 成功但无结果，继续尝试下一个源
      } catch (e) {
        if (e && e.name === 'AbortError') return; // 用户新输入取消了
        lastErr = e;
        console.warn(`[search] ${p.name} 失败:`, e);
      }
    }

    // 全部 provider 都没有结果
    if (lastErr) {
      resultsEl.innerHTML = `
        <div class="map-search-empty">
          😥 搜索服务暂时不可用<br>
          <span style="font-size:11px;opacity:.7">可点击下方链接跳转高德地图搜索</span>
        </div>
        ${searchFooter(query)}
      `;
    } else {
      resultsEl.innerHTML = `
        <div class="map-search-empty">
          😕 没找到匹配的地点<br>
          <span style="font-size:11px;opacity:.7">试试更简短或用其它关键词</span>
        </div>
        ${searchFooter(query)}
      `;
    }
    lucide.createIcons();
  }

  /* ---------- 数据源 1：高德 ditu.amap.com 前端接口（JSONP / 国内可达） ---------- */
  function searchViaAmap(query) {
    return new Promise((resolve, reject) => {
      const cbName = '__amapCb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const script = document.createElement('script');
      let settled = false;

      const cleanup = () => {
        delete window[cbName];
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      // 支持 AbortController 取消
      const onAbort = () => {
        if (settled) return;
        settled = true;
        cleanup();
        const err = new Error('aborted');
        err.name = 'AbortError';
        reject(err);
      };
      if (searchAbortCtrl) {
        searchAbortCtrl.signal.addEventListener('abort', onAbort, { once: true });
      }

      window[cbName] = (data) => {
        if (settled) return;
        settled = true;
        cleanup();
        try {
          // 高德 POI 搜索返回 data.poi_list (数组)
          const pois = (data && (data.poi_list || (data.data && data.data.poi_list))) || [];
          const list = pois.map(poi => {
            // 坐标字段可能为 "lng,lat" 字符串
            let lng = parseFloat(poi.longitude);
            let lat = parseFloat(poi.latitude);
            if ((!lng || !lat) && typeof poi.location === 'string') {
              const [a, b] = poi.location.split(',').map(parseFloat);
              lng = a; lat = b;
            }
            if (!lng || !lat) return null;
            const addr = [poi.pname, poi.cityname, poi.adname, poi.address].filter(Boolean).join(' ');
            return {
              __src: 'amap',
              name: poi.name || poi.disp_name || '未命名地点',
              display_name: addr || poi.name,
              lat, lon: lng,
              type: poi.typecode || '',
              class: (poi.type || '').split(';')[0] || '',
              city: poi.cityname || poi.pname || ''
            };
          }).filter(Boolean);
          resolve(list);
        } catch (e) {
          reject(e);
        }
      };

      // 江苏北部范围作为首选城市/视口
      const city = '连云港';
      const url = `https://restapi.amap.com/v3/place/text?key=&keywords=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&offset=10&page=1&extensions=base&output=json&callback=${cbName}`;
      // 说明：上面 restapi 需要 key，实测不可靠。我们使用 ditu.amap.com 的官方前端接口：
      const pageUrl = `https://www.amap.com/service/poiInfo?query_type=TQUERY&pagesize=10&pagenum=1&qii=true&cluster_state=5&need_utd=true&utd_sceneid=1000&div=PC1000&addr_poi_merge=true&is_classify=true&keywords=${encodeURIComponent(query)}&city=320700&callback=${cbName}`;
      // city=320700 连云港行政编码；如果关键词已包含城市名，高德会忽略该 city

      script.src = pageUrl;
      script.onerror = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('amap script error'));
      };
      document.head.appendChild(script);

      // 8 秒超时
      setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('amap timeout'));
      }, 8000);
    });
  }

  /* ---------- 数据源 2：Nominatim（海外 OSM，兜底） ---------- */
  async function searchViaNominatim(query) {
    const viewbox = '118.5,35.2,120.5,32.5'; // left,top,right,bottom
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10&accept-language=zh-CN&viewbox=${viewbox}&bounded=0`;
    const r = await fetch(url, {
      signal: searchAbortCtrl.signal,
      headers: { 'Accept-Language': 'zh-CN' }
    });
    if (!r.ok) throw new Error('nominatim ' + r.status);
    const data = await r.json();
    // 统一字段
    return (data || []).map(it => ({
      __src: 'osm',
      name: (it.namedetails && (it.namedetails['name:zh'] || it.namedetails.name)) || (it.display_name || '').split(',')[0],
      display_name: it.display_name,
      lat: it.lat, lon: it.lon,
      type: it.type, class: it.class,
      namedetails: it.namedetails
    }));
  }

  function searchFooter(query) {
    const amapUrl = `https://uri.amap.com/search?keyword=${encodeURIComponent(query)}&src=trip&coordinate=gaode&callnative=1`;
    return `
      <div class="map-search-footer">
        <a href="${amapUrl}" target="_blank">
          🔎 在高德地图打开搜索"${escapeHtml(query)}"
          <i data-lucide="external-link" class="w-3 h-3"></i>
        </a>
      </div>
    `;
  }

  function renderSearchResults(query, results) {
    const resultsEl = document.getElementById('mapSearchResults');
    if (!results || results.length === 0) {
      resultsEl.innerHTML = `
        <div class="map-search-empty">
          😕 没找到匹配的地点<br>
          <span style="font-size:11px;opacity:.7">试试更简短或用其它关键词</span>
        </div>
        ${searchFooter(query)}
      `;
      lucide.createIcons();
      return;
    }

    resultsEl.innerHTML = results.map((r, idx) => {
      const icon = iconForOSM(r.type, r.class);
      const title = r.name || (r.namedetails && (r.namedetails['name:zh'] || r.namedetails.name)) || (r.display_name || '').split(',')[0];
      const addr = r.display_name || '';
      return `
        <div class="map-search-item" data-idx="${idx}">
          <div class="map-search-item-icon">${icon}</div>
          <div class="map-search-item-content">
            <div class="map-search-item-name">${escapeHtml(title)}</div>
            <div class="map-search-item-desc">${escapeHtml(addr)}</div>
          </div>
        </div>
      `;
    }).join('') + searchFooter(query);

    // 绑定点击
    resultsEl.querySelectorAll('.map-search-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = +el.dataset.idx;
        const r = results[idx];
        selectSearchResult(r);
      });
    });

    lucide.createIcons();
  }

  function selectSearchResult(r) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    const title = r.name || (r.namedetails && (r.namedetails['name:zh'] || r.namedetails.name)) || (r.display_name || '').split(',')[0];
    const addr = r.display_name || '';

    // 飞到位置
    map.flyTo([lat, lng], 15, { duration: 0.8 });

    // 关闭下拉
    document.getElementById('mapSearchResults').classList.remove('show');

    // 移除旧的搜索 marker
    if (searchMarker) { map.removeLayer(searchMarker); searchMarker = null; }

    // 加临时 marker（脉动红点）
    const html = `<div class="search-marker-pin"><div class="search-marker-pulse"></div><div class="search-marker-dot">📍</div></div>`;
    const icon = L.divIcon({ html, className: 'search-marker', iconSize: [40, 40], iconAnchor: [20, 20] });
    searchMarker = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(map);

    const ourType = osmToOurType(r.type, r.class);
    const popupHtml = `
      <div class="search-marker-popup">
        <div class="search-title">${escapeHtml(title)}</div>
        <div class="search-addr">${escapeHtml(addr)}</div>
        <div class="search-actions">
          <a href="javascript:void(0)" onclick="MapModule.saveSearchResult('${encodeURIComponent(JSON.stringify({ name: title, lat, lng, type: ourType, desc: addr.split(/[,\s]/).filter(Boolean).slice(0,2).join(' ') }))}')" style="background:#1B5E57;color:#fff;">
            ➕ 添加到点位
          </a>
          <a href="javascript:void(0)" onclick="MapModule.clearSearchMarker()" style="background:var(--card-soft);color:var(--ink-soft);">
            ✖️ 关闭
          </a>
        </div>
      </div>
    `;
    searchMarker.bindPopup(popupHtml, { maxWidth: 280, minWidth: 220 }).openPopup();
  }

  function clearSearchMarker() {
    if (searchMarker) {
      map.removeLayer(searchMarker);
      searchMarker = null;
    }
  }

  function saveSearchResult(encoded) {
    try {
      const payload = JSON.parse(decodeURIComponent(encoded));
      // 打开"添加点位" Modal，预填字段
      Modal.open({
        title: '➕ 添加搜索结果到点位',
        html: placeFormHtml({
          name: payload.name,
          type: payload.type,
          desc: payload.desc,
          lat: payload.lat.toFixed(6),
          lng: payload.lng.toFixed(6),
          groupId: Array.from(activeGroupIds)[0] || getData().groups[0]?.id,
          city: payload.desc.split(',')[0] || ''
        }),
        confirmText: '添加',
        onConfirm: () => {
          const name = Modal.getValue('p_name').trim();
          if (!name) { toast('名称必填', 'error'); return false; }
          const data = getData();
          data.items.push({
            id: uid(), name,
            type: Modal.getValue('p_type'),
            groupId: Modal.getValue('p_group'),
            city: Modal.getValue('p_city').trim(),
            desc: Modal.getValue('p_desc').trim(),
            lat: parseFloat(Modal.getValue('p_lat')) || payload.lat,
            lng: parseFloat(Modal.getValue('p_lng')) || payload.lng
          });
          save(data);
          clearSearchMarker();
          refresh();
          toast('已添加到点位');
        }
      });
    } catch (e) {
      toast('添加失败', 'error');
    }
  }

  function initSearch() {
    const input = document.getElementById('mapSearchInput');
    const results = document.getElementById('mapSearchResults');
    const clearBtn = document.getElementById('mapSearchClear');

    input.addEventListener('input', () => {
      const q = input.value.trim();
      clearBtn.style.display = q ? 'flex' : 'none';

      clearTimeout(searchTimer);
      if (!q) {
        results.classList.remove('show');
        return;
      }
      if (q.length < 2) {
        results.classList.add('show');
        results.innerHTML = `<div class="map-search-empty">至少输入 2 个字符</div>`;
        return;
      }
      // 防抖 400ms
      searchTimer = setTimeout(() => searchPlaces(q), 400);
    });

    input.addEventListener('focus', () => {
      if (input.value.trim().length >= 2) results.classList.add('show');
    });

    // 回车立即搜索
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchTimer);
        const q = input.value.trim();
        if (q.length >= 2) searchPlaces(q);
      } else if (e.key === 'Escape') {
        results.classList.remove('show');
        input.blur();
      }
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      results.classList.remove('show');
      input.focus();
    });

    // 点外关闭
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.map-search')) {
        results.classList.remove('show');
      }
    });
  }

  function manageGroups() {
    const data = getData();
    const listHtml = data.groups.map(g => `
      <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 mb-2">
        <span class="w-3 h-3 rounded-full" style="background:${g.color}"></span>
        <input class="gm_name flex-1" data-gid="${g.id}" value="${escapeHtml(g.name)}">
        <input class="gm_color" data-gid="${g.id}" value="${g.color}" style="width:80px;padding:4px 6px" type="color">
        <button class="icon-btn danger" data-del="${g.id}"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
      </div>
    `).join('');

    Modal.open({
      title: '分组管理',
      html: `
        <div>${listHtml}</div>
        <button id="gm_add" class="btn btn-outline text-sm w-full mt-2"><i data-lucide="plus" class="w-4 h-4"></i>添加分组</button>
        <p class="text-xs text-slate-500 mt-3">💡 删除分组时，其中的点位会移到第一个分组。</p>
      `,
      onConfirm: () => {
        // 保存修改后的名字和颜色
        document.querySelectorAll('.gm_name').forEach(i => {
          const g = data.groups.find(x => x.id === i.dataset.gid);
          if (g) g.name = i.value.trim() || g.name;
        });
        document.querySelectorAll('.gm_color').forEach(i => {
          const g = data.groups.find(x => x.id === i.dataset.gid);
          if (g) g.color = i.value;
        });
        save(data);
        activeGroupIds.clear();
        refresh();
      }
    });

    // 绑定动态事件（在 Modal 打开后）
    setTimeout(() => {
      document.querySelectorAll('[data-del]').forEach(b => {
        b.addEventListener('click', () => {
          const gid = b.dataset.del;
          if (data.groups.length <= 1) { toast('至少保留一个分组', 'error'); return; }
          if (!confirm('删除该分组？其中的点位会移到第一个分组')) return;
          const firstId = data.groups.find(g => g.id !== gid).id;
          data.items.forEach(it => { if (it.groupId === gid) it.groupId = firstId; });
          data.groups = data.groups.filter(g => g.id !== gid);
          save(data);
          Modal.hide();
          manageGroups();
        });
      });
      document.getElementById('gm_add')?.addEventListener('click', () => {
        const name = prompt('新分组名称：');
        if (!name) return;
        data.groups.push({ id: uid(), name: name.trim(), color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6,'0') });
        save(data);
        Modal.hide();
        manageGroups();
      });
    }, 60);
  }

  function updateMapInfoBar() {
    const el = document.getElementById('mapInfoText');
    if (!el) return;
    const data = getData();
    const total = data.items.length;
    const visible = data.items.filter(p => activeGroupIds.has(p.groupId)).length;
    if (visible === total) {
      el.textContent = `${total} 个点位`;
    } else {
      el.textContent = `显示 ${visible} / 共 ${total}`;
    }
  }

  function refresh() {
    renderGroupFilter();
    renderMarkers();
    renderPlaceList();
    updateRouteSelects();
    updateMapInfoBar();
    // 自适应视野
    const data = getData();
    const visible = data.items.filter(p => activeGroupIds.has(p.groupId));
    if (visible.length > 0 && !routeLayer) {
      const bounds = L.latLngBounds(visible.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds.pad(0.15));
    }
  }

  function init() {
    initMap();
    refresh();
    initSearch();

    document.getElementById('mapAddBtn').addEventListener('click', () => {
      if (addingMode) exitAddingMode();
      else {
        enterAddingMode();
        toast('点击地图任意位置添加点位');
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
      }
    });
    document.getElementById('mapGroupBtn').addEventListener('click', manageGroups);
    document.getElementById('mapResetBtn').addEventListener('click', () => {
      if (confirm('重置所有地图点位到默认？')) {
        STORE.reset('places');
        activeGroupIds.clear();
        clearRoute();
        refresh();
        toast('已重置');
      }
    });
    document.getElementById('routeGoBtn').addEventListener('click', planRoute);
    document.getElementById('routeClearBtn').addEventListener('click', () => clearRoute(true));

    // 起点/终点卡片点击打开选择器
    document.getElementById('routeFromBtn').addEventListener('click', () => openPlacePicker('from'));
    document.getElementById('routeToBtn').addEventListener('click', () => openPlacePicker('to'));

    // 交换
    document.getElementById('routeSwapBtn').addEventListener('click', swapRoute);

    // 交通方式切换
    document.querySelectorAll('.route-mode-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.route-mode-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        routeMode = chip.dataset.mode;
        if (routeFromId && routeToId) planRoute();
      });
    });
  }

  return { init, editPlace, deletePlace, setRouteEndpoint, saveSearchResult, clearSearchMarker, getMap: () => map };
})();
MapModule.init();

/* =================================================================
 * 其他小模块：美食 / 图片 / 返回顶部 / 夜间模式 / 导航高亮
 * ================================================================= */
/* 美食 */
document.getElementById('restaurantsLyg').innerHTML = RESTAURANTS_LYG.map(r => `
  <a href="${r.url}" target="_blank" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
    <div><b class="text-sm">${r.name}</b><p class="text-xs text-slate-500">${r.desc}</p></div>
    <span class="text-sm text-[color:var(--accent-2)] font-semibold">${r.avg}</span>
  </a>`).join('');
document.getElementById('mustEatLyg').innerHTML = MUSTEAT_LYG.map(m => `<span class="tag tag-orange">${m}</span>`).join('');
document.getElementById('restaurantsHa').innerHTML = RESTAURANTS_HA.map(r => `
  <a href="${r.url}" target="_blank" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
    <div><b class="text-sm">${r.name}</b><p class="text-xs text-slate-500">${r.desc}</p></div>
    <span class="text-sm text-[color:var(--accent-2)] font-semibold">${r.avg}</span>
  </a>`).join('');
document.getElementById('mustEatHa').innerHTML = MUSTEAT_HA.map(m => `<span class="tag tag-blue">${m}</span>`).join('');
document.querySelectorAll('.food-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.food-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.food-pane').forEach(p => p.style.display = 'none');
    document.getElementById('foodPane-' + btn.dataset.food).style.display = 'block';
  });
});

/* 快速链接 */
document.getElementById('quickLinks').innerHTML = QUICK_LINKS.map(l => `
  <a href="${l.url}" target="_blank" class="btn btn-outline">
    <i data-lucide="${l.icon}" class="w-4 h-4"></i>${l.label}
    <i data-lucide="external-link" class="w-3 h-3"></i>
  </a>`).join('');

/* Lightbox */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
document.querySelectorAll('.img-item img').forEach(img => {
  img.parentElement.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('show');
  });
});
document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('show'));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('show'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.classList.remove('show'); });

/* 返回顶部 */
const backTop = document.getElementById('back-top');
window.addEventListener('scroll', () => {
  backTop.classList.toggle('show', window.scrollY > 300);
});
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* 夜间模式 */
const DARK_KEY = 'jiangsu-dark';
const darkBtn = document.getElementById('darkBtn');
function applyDark(on) {
  document.documentElement.classList.toggle('dark', on);
  darkBtn.innerHTML = on ? '<i data-lucide="sun" class="w-4 h-4"></i>' : '<i data-lucide="moon" class="w-4 h-4"></i>';
  lucide.createIcons();
}
applyDark(localStorage.getItem(DARK_KEY) === '1');
darkBtn.addEventListener('click', () => {
  const isDark = !document.documentElement.classList.contains('dark');
  localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
  applyDark(isDark);
});

/* ============ 视图模式切换（移动/桌面） ============ */
const VIEW_KEY = 'jiangsu-view';  // 'mobile' | 'desktop'
const viewBtn = document.getElementById('viewBtn');

function getView() {
  return localStorage.getItem(VIEW_KEY) || 'mobile';  // 默认 mobile
}
function applyView(mode) {
  document.documentElement.setAttribute('data-view', mode);
  viewBtn.innerHTML = mode === 'mobile'
    ? '<i data-lucide="monitor" class="w-4 h-4"></i>'
    : '<i data-lucide="smartphone" class="w-4 h-4"></i>';
  viewBtn.title = mode === 'mobile' ? '切到电脑视图' : '切到手机视图';
  lucide.createIcons();
  // 触发 FAB 更新（因为 isMobileView 可能变了）
  if (typeof updateFab === 'function') updateFab();
  // 地图需要重新计算尺寸
  setTimeout(() => {
    try {
      const m = (typeof MapModule !== 'undefined' && MapModule.getMap) ? MapModule.getMap() : null;
      if (m && m.invalidateSize) m.invalidateSize();
    } catch (e) {}
  }, 350);
}
applyView(getView());

viewBtn.addEventListener('click', () => {
  const next = getView() === 'mobile' ? 'desktop' : 'mobile';
  localStorage.setItem(VIEW_KEY, next);
  applyView(next);
  if (navigator.vibrate) navigator.vibrate(15);
  toast(next === 'mobile' ? '已切换到手机视图' : '已切换到电脑视图');
});

/* 判断当前是否应显示移动端交互（FAB/底部导航） */
function isMobileView() {
  return document.documentElement.getAttribute('data-view') === 'mobile';
}

/* 滚动高亮导航 */
const SECTIONS = ['overview','timeline','todo','map-section','food','tips'];
const navLinks = document.querySelectorAll('.nav-link');
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
let currentSection = 'overview';

function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  let current = SECTIONS[0];
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  }
  currentSection = current;
  navLinks.forEach(a => {
    const href = a.getAttribute('href').slice(1);
    a.classList.toggle('active', href === current);
  });
  mobileNavItems.forEach(a => {
    a.classList.toggle('active', a.dataset.nav === current);
  });
  updateFab();
}

window.addEventListener('scroll', updateActiveNav);

/* ============ 移动端 FAB 上下文按钮 ============ */
const fab = document.getElementById('contextFab');
const FAB_MAP = {
  timeline: { label: '新增时间点', action: () => {
    // 直接触发第一个日（day1）的新增按钮
    const btn = document.querySelector('#planContent [data-add="day1"]');
    if (btn) btn.click();
  }},
  todo: { label: '新增清单', action: () => document.getElementById('addTodoBtn').click() },
  'map-section': { label: '添加点位', action: () => document.getElementById('mapAddBtn').click() }
};

function updateFab() {
  // FAB 只在手机视图 + 特定 section 显示
  if (!isMobileView()) { fab.style.display = 'none'; return; }
  const cfg = FAB_MAP[currentSection];
  if (cfg) {
    fab.style.display = 'flex';
    fab.title = cfg.label;
  } else {
    fab.style.display = 'none';
  }
}

fab.addEventListener('click', () => {
  const cfg = FAB_MAP[currentSection];
  if (cfg) {
    if (navigator.vibrate) navigator.vibrate(20);
    cfg.action();
  }
});

window.addEventListener('resize', updateFab);

/* ============ 触摸震动反馈 ============ */
function vibrate(ms = 15) {
  if (navigator.vibrate) navigator.vibrate(ms);
}
document.addEventListener('click', (e) => {
  const target = e.target.closest('.btn-primary, .tab-btn:not(.active), .todo-checkbox, .icon-btn, .fab');
  if (target && navigator.vibrate) vibrate(10);
}, { passive: true });

lucide.createIcons();
updateActiveNav();





