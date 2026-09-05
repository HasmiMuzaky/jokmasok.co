document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "https://script.google.com/macros/s/AKfycbxgwyni7Nhd3OfDD9-manjDxLMxlhhfMTYyZ_dQqbTffcP61SidX2C4ayyUXBh-RObB/exec";

  // Elemen Drawer
  const btnOpenMenu = document.getElementById('btn-open-menu');
  const btnCloseMenu = document.getElementById('btn-close-menu');
  const menuDrawer = document.getElementById('menu-drawer');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const menuRefresh = document.getElementById('menu-refresh');

  // Metrik Alur
  const statQueue = document.getElementById('stat-queue');
  const statProgress = document.getElementById('stat-progress');
  const statReview = document.getElementById('stat-review');
  const statWorkers = document.getElementById('stat-workers');

  // Metrik Finansial
  const finDeal = document.getElementById('fin-deal');
  const finPaid = document.getElementById('fin-paid');
  const finRemaining = document.getElementById('fin-remaining');
  const finProfit = document.getElementById('fin-profit');
  const labelOrderTotal = document.getElementById('label-order-total');

  // Tabel Body
  const tableBody = document.getElementById('table-recent-body');

  // Parser Angka Murni & Anti String Concatenation
  const parseNominal = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const str = String(val).replace(/Rp\s?/gi, '').replace(/\./g, '').replace(/,/g, '.').trim();
    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.round(num);
  };

  const formatRupiah = (val) => {
    const cleanNum = parseNominal(val);
    return "Rp " + cleanNum.toLocaleString('id-ID');
  };

  const escapeHtml = (text) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, (m) => map[m]);
  };

  const fetchDashboardData = async () => {
    try {
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">Menyinkronkan data database...</td></tr>';
      }

      const res = await fetch(`${API_URL}?_nocache=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!res.ok) throw new Error("Gagal mengambil data");

      const tasks = await res.json();
      renderDashboard(Array.isArray(tasks) ? tasks : []);
    } catch (err) {
      console.error(err);
      if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #ef4444; padding: 24px;">Gagal memuat database spreadsheet.</td></tr>';
      }
    }
  };

  const renderDashboard = (tasks) => {
    let qCount = 0;
    let pCount = 0;
    let rCount = 0;
    const activeWorkersSet = new Set();

    let sumDeal = 0;
    let sumCash = 0;
    let sumRemaining = 0;
    let sumProfit = 0;

    const activeList = [];

    tasks.forEach((t) => {
      // Pastikan konversi ke Number bulat
      const deal = parseNominal(t.totalDeal);
      const paid = parseNominal(t.amountPaid);
      const fee = parseNominal(t.fee);
      const remaining = Math.max(0, deal - paid);
      const profit = deal - fee;

      sumDeal += deal;
      sumCash += paid;
      sumRemaining += remaining;
      sumProfit += profit;

      const workerClean = String(t.worker || '').trim();
      const statusClean = String(t.status || 'Antrean').trim().toLowerCase();

      if (statusClean === 'selesai') return;

      activeList.push(t);

      if (workerClean !== '') {
        activeWorkersSet.add(workerClean);
      }

      const isProgress = statusClean.includes('sedang') || statusClean.includes('kerja') || statusClean.includes('proses') || workerClean !== '';
      const isReview = statusClean.includes('review') || statusClean.includes('cek');

      if (isReview) {
        rCount++;
      } else if (isProgress) {
        pCount++;
      } else {
        qCount++;
      }
    });

    // Update Counter Alur
    if (statQueue) statQueue.textContent = qCount;
    if (statProgress) statProgress.textContent = pCount;
    if (statReview) statReview.textContent = rCount;
    if (statWorkers) statWorkers.textContent = `${activeWorkersSet.size} Orang`;

    // Update Finansial Akurat
    if (labelOrderTotal) labelOrderTotal.textContent = `Total ${tasks.length} Pesanan Terdata`;
    if (finDeal) finDeal.textContent = formatRupiah(sumDeal);
    if (finPaid) finPaid.textContent = formatRupiah(sumCash);
    if (finRemaining) finRemaining.textContent = formatRupiah(sumRemaining);
    if (finProfit) finProfit.textContent = formatRupiah(sumProfit);

    // Render Tabel / Kartu Mobile
    if (tableBody) {
      if (activeList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">Tidak ada tugas aktif saat ini.</td></tr>';
        return;
      }

      tableBody.innerHTML = '';
      const recentTasks = activeList.slice(0, 5);

      recentTasks.forEach((item) => {
        const workerText = item.worker 
          ? `<span style="color: var(--accent-cyan); font-weight: 600;">${escapeHtml(item.worker)}</span>` 
          : `<span style="color: var(--status-queue);">Belum Ada Joki</span>`;

        let statusBadge = `<span style="background: rgba(245, 158, 11, 0.15); color: var(--status-queue); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Antrean</span>`;
        const sLower = String(item.status || '').toLowerCase();
        if (sLower.includes('sedang') || sLower.includes('kerja') || item.worker) {
          statusBadge = `<span style="background: rgba(56, 189, 248, 0.15); color: var(--accent-cyan); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Dikerjakan</span>`;
        } else if (sLower.includes('review')) {
          statusBadge = `<span style="background: rgba(168, 85, 247, 0.15); color: var(--status-review); padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700;">Review</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="m-top">
              <strong style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(item.id)}</strong>
              ${statusBadge}
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: #fff;">${escapeHtml(item.clientName)}</div>
            <div style="font-size: 0.74rem; color: var(--text-muted);">${escapeHtml(item.institution || '-')}</div>
          </td>
          <td>
            <div style="font-weight: 500; font-size: 0.82rem; color: #cbd5e1;">${escapeHtml(item.taskTitle)}</div>
            <div style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 600;">${escapeHtml(item.packageDetail || 'Skripsi')}</div>
          </td>
          <td style="font-size: 0.78rem; color: #94a3b8;">
            Target: <strong style="color: #f1f5f9;">${escapeHtml(item.duration || '-')}</strong>
          </td>
          <td style="font-size: 0.78rem;">
            Joki: ${workerText}
          </td>
          <td class="m-action">
            <a href="kelola-order.html?id=${encodeURIComponent(item.id)}" class="btn-secondary">Kelola / Delegasi ➔</a>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    }
  };

  // Drawer Samping
  const openDrawer = () => { menuDrawer.classList.add('open'); sidebarOverlay.classList.add('active'); };
  const closeDrawer = () => { menuDrawer.classList.remove('open'); sidebarOverlay.classList.remove('active'); };

  if (btnOpenMenu) btnOpenMenu.addEventListener('click', openDrawer);
  if (btnCloseMenu) btnCloseMenu.addEventListener('click', closeDrawer);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeDrawer);

  if (menuRefresh) {
    menuRefresh.addEventListener('click', () => {
      closeDrawer();
      fetchDashboardData();
    });
  }

  fetchDashboardData();
});
