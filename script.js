(() => {
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        document.body.classList.remove('menu-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  document.querySelectorAll('.faq-item').forEach(item => {
    const button = item.querySelector('.faq-question');
    button.addEventListener('click', () => {
      const active = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!active) item.classList.add('active');
    });
  });

  const feed = document.getElementById('statusFeed');
  const percent = document.getElementById('heroPercent');
  const heroBar = document.querySelector('.hero-progress');

  const states = [
    ['Hasta bilgileri okunuyor...', 40],
    ['İlaç bilgileri kontrol ediliyor...', 47],
    ['İlaç ve rapor eşleşmesi değerlendiriliyor...', 55],
    ['Uzmanlık ve tarih kriterleri kontrol ediliyor...', 63],
    ['Kontrol sonucu hazırlanıyor...', 70]
  ];

  let stateIndex = 0;
  setInterval(() => {
    stateIndex = (stateIndex + 1) % states.length;
    const [text, value] = states[stateIndex];
    if (feed) feed.textContent = text;
    if (percent) percent.textContent = `${value}%`;
    if (heroBar) heroBar.style.width = `${value}%`;
  }, 2600);

  const header = document.querySelector('.site-header');
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.desktop-nav a')];

  const setActiveLink = () => {
    const y = window.scrollY + 120;
    let current = '';
    sections.forEach(section => {
      if (section.offsetTop <= y) current = section.id;
    });

    links.forEach(link => {
      const target = link.getAttribute('href').slice(1);
      link.style.color = target === current ? '#02983E' : '';
    });

    if (header) {
      header.style.boxShadow = window.scrollY > 10
        ? '0 8px 30px rgba(15,23,42,.05)'
        : 'none';
    }
  };

  window.addEventListener('scroll', setActiveLink, { passive:true });
  setActiveLink();
})();


  // Demo modal & WhatsApp lead handoff
  const demoModal = document.getElementById('demoModal');
  const demoForm = document.getElementById('demoForm');
  const demoTriggers = document.querySelectorAll('.demo-trigger');
  const closeDemoButtons = document.querySelectorAll('[data-close-demo]');

  const openDemo = () => {
    if (!demoModal) return;
    demoModal.classList.add('open');
    demoModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    setTimeout(() => document.getElementById('demoName')?.focus(), 180);
  };

  const closeDemo = () => {
    if (!demoModal) return;
    demoModal.classList.remove('open');
    demoModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  };

  demoTriggers.forEach(btn => btn.addEventListener('click', openDemo));
  closeDemoButtons.forEach(btn => btn.addEventListener('click', closeDemo));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && demoModal?.classList.contains('open')) closeDemo();
  });

  const cleanPhone = value => value.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '');

  const showFieldError = (id, message) => {
    const field = document.getElementById(id);
    const error = document.querySelector(`[data-error-for="${id}"]`);
    if (field) field.classList.toggle('invalid', Boolean(message));
    if (error) error.textContent = message || '';
  };

  if (demoForm) {
    demoForm.addEventListener('submit', e => {
      e.preventDefault();

      const name = document.getElementById('demoName').value.trim();
      const pharmacy = document.getElementById('demoPharmacy').value.trim();
      const phoneRaw = document.getElementById('demoPhone').value.trim();
      const email = document.getElementById('demoEmail').value.trim();
      const phone = cleanPhone(phoneRaw);

      let valid = true;

      showFieldError('demoName', '');
      showFieldError('demoPharmacy', '');
      showFieldError('demoPhone', '');
      showFieldError('demoEmail', '');

      if (name.length < 2) {
        showFieldError('demoName', 'Lütfen adınızı yazın.');
        valid = false;
      }
      if (pharmacy.length < 2) {
        showFieldError('demoPharmacy', 'Lütfen eczane adını yazın.');
        valid = false;
      }
      if (phone.length < 10) {
        showFieldError('demoPhone', 'Geçerli bir telefon numarası yazın.');
        valid = false;
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError('demoEmail', 'E-posta adresini kontrol edin.');
        valid = false;
      }

      if (!valid) return;

      const message = [
        'Merhaba, ECZSGK demo talebi bırakmak istiyorum.',
        '',
        `Ad Soyad: ${name}`,
        `Eczane: ${pharmacy}`,
        `Telefon: +90${phone}`,
        email ? `E-posta: ${email}` : ''
      ].filter(Boolean).join('\n');

      const waUrl = `https://wa.me/905387883600?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank', 'noopener');
    });
  }

// ECZSGK counters + activity feed
(() => {
  const counters = document.querySelectorAll('.counter[data-target]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.target || 0);
      const duration = 1100;
      const started = performance.now();
      const tick = now => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased).toLocaleString('tr-TR');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .45 });
  counters.forEach(el => counterObserver.observe(el));

  const toast = document.getElementById('activityToast');
  const close = document.getElementById('activityClose');
  const text = document.getElementById('activityText');
  const time = document.getElementById('activityTime');
  const icon = document.getElementById('activityIcon');
  const badge = document.getElementById('activityBadge');
  const cfg = window.ECZSGK_CONFIG || {};
  const items = Array.isArray(cfg.activity) ? cfg.activity : [];
  let dismissed = false;
  let index = 0;
  let timer;

  const hideToast = () => toast?.classList.remove('show');
  const showToast = () => {
    if (!toast || dismissed || !items.length) return;
    const item = items[index % items.length];
    index += 1;
    if (text) text.textContent = item.text;
    if (time) time.textContent = item.time;
    if (icon) icon.textContent = item.icon || '●';
    if (badge) badge.textContent = cfg.activityMode === 'live' ? 'CANLI ETKİNLİK' : 'ÖRNEK ETKİNLİK';
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => {
      hideToast();
      if (!dismissed) setTimeout(showToast, 10000);
    }, 5000);
  };

  close?.addEventListener('click', () => {
    dismissed = true;
    hideToast();
  });
  setTimeout(showToast, 6500);
})();
