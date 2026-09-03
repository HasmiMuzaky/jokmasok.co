document.addEventListener('DOMContentLoaded', () => {
    const API_URL = "https://script.google.com/macros/s/AKfycbxgwyni7Nhd3OfDD9-manjDxLMxlhhfMTYyZ_dQqbTffcP61SidX2C4ayyUXBh-RObB/exec";
  
    // Kontainer List
    const listQueue = document.getElementById('list-queue');
    const listProgress = document.getElementById('list-progress');
    const listReview = document.getElementById('list-review');
    const listRevision = document.getElementById('list-revision');
    const listDone = document.getElementById('list-done');
  
    // Badge Counter Desktop
    const badgeQueue = document.getElementById('badge-count-queue');
    const badgeProgress = document.getElementById('badge-count-progress');
    const badgeReview = document.getElementById('badge-count-review');
    const badgeRevision = document.getElementById('badge-count-revision');
    const badgeDone = document.getElementById('badge-count-done');
  
    // Badge Counter Mobile
    const mCountQueue = document.getElementById('m-count-queue');
    const mCountProgress = document.getElementById('m-count-progress');
    const mCountReview = document.getElementById('m-count-review');
    const mCountRevision = document.getElementById('m-count-revision');
    const mCountDone = document.getElementById('m-count-done');
  
    const formatRupiah = (val) => {
      return "Rp " + (Number(val) || 0).toLocaleString('id-ID');
    };
  
    const escapeHtml = (text) => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
      return String(text || '').replace(/[&<>"']/g, (m) => map[m]);
    };
  
    const fetchKanbanTasks = async () => {
      try {
        const res = await fetch(`${API_URL}?_nocache=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store'
        });
  
        if (!res.ok) throw new Error("Gagal mengambil data tugas");
  
        const tasks = await res.json();
        renderKanban(Array.isArray(tasks) ? tasks : []);
      } catch (err) {
        console.error(err);
        if (listQueue) listQueue.innerHTML = '<p style="color: #ef4444; font-size: 0.8rem; text-align: center; padding: 20px;">Gagal memuat tugas.</p>';
      }
    };
  
    const renderKanban = (tasks) => {
      if (listQueue) listQueue.innerHTML = '';
      if (listProgress) listProgress.innerHTML = '';
      if (listReview) listReview.innerHTML = '';
      if (listRevision) listRevision.innerHTML = '';
      if (listDone) listDone.innerHTML = '';
  
      let qCount = 0;
      let pCount = 0;
      let rCount = 0;
      let revCount = 0;
      let doneCount = 0;
  
      tasks.forEach((item) => {
        const workerClean = String(item.worker || '').trim();
        const statusClean = String(item.status || 'Antrean').trim().toLowerCase();
        const revisions = Number(item.revisionCount) || 0;
  
        const cleanPhone = String(item.phone || '').replace(/[^0-9]/g, '');
        const internationalPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
        const waBtn = cleanPhone 
          ? `<a href="https://wa.me/${internationalPhone}" target="_blank" style="color: #25D366; text-decoration: none; font-size: 0.74rem; font-weight: 600;">💬 WA</a>` 
          : '';
        
        const fileBtn = item.fileUrl 
          ? `<a href="${item.fileUrl}" target="_blank" style="color: var(--accent-cyan); text-decoration: none; font-size: 0.74rem; font-weight: 600;">📎 Bahan</a>` 
          : '';
  
        const workerDisplay = workerClean 
          ? `<span style="color: var(--accent-cyan); font-weight: 700;">${escapeHtml(workerClean)}</span>` 
          : `<span style="color: var(--status-queue); font-weight: 600;">Belum Ada Joki</span>`;
  
        // Badge khusus jika sudah pernah atau sedang revisi
        const revisionBadge = revisions > 0 
          ? `<span class="revision-pill">🔄 Revisi Ke-${revisions}</span>` 
          : '';
  
        const card = document.createElement('article');
        card.className = 'kanban-task-card';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted);">${escapeHtml(item.id)}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              ${revisionBadge}
              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px; color: var(--accent-cyan); font-weight: 600;">
                ${escapeHtml(item.packageDetail || 'Skripsi')}
              </span>
            </div>
          </div>
  
          <div>
            <h4 style="font-size: 0.9rem; color: #fff; line-height: 1.35; margin-bottom: 2px;">${escapeHtml(item.taskTitle)}</h4>
            <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0;">
              <b style="color: #f1f5f9;">${escapeHtml(item.clientName)}</b> • ${escapeHtml(item.institution || '-')}
            </p>
          </div>
  
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); padding: 7px 10px; border-radius: 8px; font-size: 0.72rem;">
            <span>Target: <strong style="color: #f1f5f9;">${escapeHtml(item.duration || '-')}</strong></span>
            <span style="color: var(--status-success); font-weight: 700;">Masuk: ${formatRupiah(item.amountPaid)}</span>
          </div>
  
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.74rem; padding-top: 2px;">
            <span>Joki: ${workerDisplay}</span>
            <div style="display: flex; gap: 8px;">
              ${waBtn}
              ${fileBtn}
            </div>
          </div>
  
          <div style="margin-top: 4px;">
            <a href="kelola-order.html?id=${encodeURIComponent(item.id)}" class="btn-secondary" style="width: 100%; font-size: 0.75rem; padding: 6px;">
              Kelola / Update Status ➔
            </a>
          </div>
        `;
  
        // Pengelompokan 5 Alur Kolom
        if (statusClean.includes('selesai')) {
          doneCount++;
          if (listDone) listDone.appendChild(card);
        } else if (statusClean.includes('revisi')) {
          revCount++;
          if (listRevision) listRevision.appendChild(card);
        } else if (statusClean.includes('review') || statusClean.includes('cek')) {
          rCount++;
          if (listReview) listReview.appendChild(card);
        } else if (statusClean.includes('sedang') || statusClean.includes('kerja') || statusClean.includes('proses') || workerClean !== '') {
          pCount++;
          if (listProgress) listProgress.appendChild(card);
        } else {
          qCount++;
          if (listQueue) listQueue.appendChild(card);
        }
      });
  
      // Handle Tampilan Kosong
      if (qCount === 0 && listQueue) listQueue.innerHTML = '<p style="color: var(--text-muted); font-size: 0.78rem; text-align: center; padding: 24px 0;">Tidak ada antrean.</p>';
      if (pCount === 0 && listProgress) listProgress.innerHTML = '<p style="color: var(--text-muted); font-size: 0.78rem; text-align: center; padding: 24px 0;">Tidak ada tugas aktif.</p>';
      if (rCount === 0 && listReview) listReview.innerHTML = '<p style="color: var(--text-muted); font-size: 0.78rem; text-align: center; padding: 24px 0;">Tidak ada tugas review.</p>';
      if (revCount === 0 && listRevision) listRevision.innerHTML = '<p style="color: var(--text-muted); font-size: 0.78rem; text-align: center; padding: 24px 0;">Tidak ada tugas revisi.</p>';
      if (doneCount === 0 && listDone) listDone.innerHTML = '<p style="color: var(--text-muted); font-size: 0.78rem; text-align: center; padding: 24px 0;">Belum ada arsip selesai.</p>';
  
      // Update Counter
      if (badgeQueue) badgeQueue.textContent = qCount;
      if (badgeProgress) badgeProgress.textContent = pCount;
      if (badgeReview) badgeReview.textContent = rCount;
      if (badgeRevision) badgeRevision.textContent = revCount;
      if (badgeDone) badgeDone.textContent = doneCount;
  
      if (mCountQueue) mCountQueue.textContent = qCount;
      if (mCountProgress) mCountProgress.textContent = pCount;
      if (mCountReview) mCountReview.textContent = rCount;
      if (mCountRevision) mCountRevision.textContent = revCount;
      if (mCountDone) mCountDone.textContent = doneCount;
    };
  
    // Navigasi Tab Mobile
    const tabBtns = document.querySelectorAll('.k-tab-btn');
    const cols = document.querySelectorAll('.kanban-col');
  
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        cols.forEach((c) => c.classList.remove('active-col'));
  
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetCol = document.getElementById(targetId);
        if (targetCol) targetCol.classList.add('active-col');
      });
    });
  
    // Drawer Samping
    const btnOpenMenu = document.getElementById('btn-open-menu');
    const btnCloseMenu = document.getElementById('btn-close-menu');
    const menuDrawer = document.getElementById('menu-drawer');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const menuRefresh = document.getElementById('menu-refresh');
  
    const openDrawer = () => { menuDrawer.classList.add('open'); sidebarOverlay.classList.add('active'); };
    const closeDrawer = () => { menuDrawer.classList.remove('open'); sidebarOverlay.classList.remove('active'); };
  
    if (btnOpenMenu) btnOpenMenu.addEventListener('click', openDrawer);
    if (btnCloseMenu) btnCloseMenu.addEventListener('click', closeDrawer);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeDrawer);
  
    if (menuRefresh) {
      menuRefresh.addEventListener('click', () => {
        closeDrawer();
        fetchKanbanTasks();
      });
    }
  
    fetchKanbanTasks();
  });