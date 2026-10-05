/* ЛИЗА — interactions */
(function () {
  'use strict';

  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BOOK = 'https://link.2gis.ru/4.3/3F5B374E/aHR0cDovL2Rpa2lkaS5uZXQvOTYyNjY2';

  /* ---------------- header ---------------- */
  var header = doc.getElementById('header');
  var lastY = window.scrollY;

  function onScrollHeader() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 16);

    if (y > 160 && y > lastY + 4) {
      header.classList.add('is-hidden');
    } else if (y < lastY - 6 || y < 160) {
      header.classList.remove('is-hidden');
    }
    lastY = y;
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------------- mobile menu ---------------- */
  var menu = doc.getElementById('mobile-menu');
  var burger = doc.querySelector('.burger');
  var closeBtn = doc.querySelector('.menu__close');

  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    doc.body.classList.add('menu-open');
    doc.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    doc.body.classList.remove('menu-open');
    doc.body.style.overflow = '';
  }

  if (burger) burger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  menu.addEventListener('click', function (e) {
    if (e.target === menu) closeMenu();
    var link = e.target.closest('.menu__link, .menu__panel a[href^="#"]');
    if (link) closeMenu();
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });

  /* ---------------- accordion ---------------- */
  var accItems = Array.prototype.slice.call(doc.querySelectorAll('.acc__item'));

  function setPanel(item, open) {
    var btn = item.querySelector('.acc__btn');
    var panel = item.querySelector('.acc__panel');
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
  }

  accItems.forEach(function (item) {
    var btn = item.querySelector('.acc__btn');
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      accItems.forEach(function (other) {
        if (other !== item && other.classList.contains('is-open')) setPanel(other, false);
      });
      setPanel(item, !isOpen);
      if (!isOpen && window.__previewHide) window.__previewHide();
    });
  });

  window.addEventListener('resize', function () {
    accItems.forEach(function (item) {
      if (item.classList.contains('is-open')) {
        var panel = item.querySelector('.acc__panel');
        panel.style.maxHeight = 'none';
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* open first category */
  if (accItems.length) setPanel(accItems[0], true);

  /* ---------------- services hover preview ---------------- */
  var preview = doc.getElementById('accPreview');
  var previewImg = preview ? preview.querySelector('img') : null;
  var canHover = window.matchMedia('(hover: hover) and (min-width: 1024px)').matches;

  if (preview && canHover && !reduce) {
    var section = doc.getElementById('services');
    var current = '';

    section.addEventListener('mousemove', function (e) {
      var btn = e.target.closest('.acc__btn');
      if (!btn) {
        preview.classList.remove('is-active');
        return;
      }
      var item = btn.closest('.acc__item');
      var src = item.getAttribute('data-img');
      if (src && src !== current) {
        previewImg.src = src;
        current = src;
      }
      var rect = section.getBoundingClientRect();
      preview.style.left = e.clientX - rect.left + 'px';
      preview.style.top = e.clientY - rect.top + 'px';
      preview.classList.add('is-active');
    });

    section.addEventListener('mouseleave', function () {
      preview.classList.remove('is-active');
    });

    window.__previewHide = function () {
      preview.classList.remove('is-active');
    };
  }

  /* ---------------- reveal on scroll ---------------- */
  var revealEls = Array.prototype.slice.call(doc.querySelectorAll('.reveal, .reveal-img'));

  revealEls.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d);
  });

  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------- parallax ---------------- */
  var parallaxEls = Array.prototype.slice.call(doc.querySelectorAll('[data-parallax]'));

  if (parallaxEls.length && !reduce) {
    var ticking = false;
    var run = function () {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.05;
        var progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        var offset = Math.max(-60, Math.min(60, -progress * vh * speed));
        var target = el.querySelector('img') || el;
        target.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
      });
      ticking = false;
    };
    var requestTick = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(run);
      }
    };
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    requestTick();
  }

  /* ---------------- works: show all ---------------- */
  var moreBtn = doc.getElementById('worksMore');
  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      var hidden = doc.querySelectorAll('.w-item.is-hidden');
      var expanded = moreBtn.getAttribute('data-expanded') === 'true';

      if (!expanded) {
        Array.prototype.forEach.call(hidden, function (item, i) {
          item.classList.remove('is-hidden');
          item.style.setProperty('--d', i + 1);
          window.requestAnimationFrame(function () {
            window.setTimeout(function () { item.classList.add('is-visible'); }, 60 * i);
          });
        });
        moreBtn.setAttribute('data-expanded', 'true');
        moreBtn.childNodes[0].nodeValue = 'Скрыть часть работ ';
        moreBtn.querySelector('svg').style.transform = 'rotate(-90deg)';
      } else {
        Array.prototype.forEach.call(doc.querySelectorAll('.w-item'), function (item, i) {
          if (i > 6) item.classList.add('is-hidden');
        });
        moreBtn.setAttribute('data-expanded', 'false');
        moreBtn.childNodes[0].nodeValue = 'Смотреть все работы ';
        moreBtn.querySelector('svg').style.transform = '';
        doc.getElementById('works').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  /* ---------------- smooth anchors ---------------- */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var target = doc.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* ---------------- year ---------------- */
  var year = doc.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------------- booking links safety ---------------- */
  Array.prototype.forEach.call(doc.querySelectorAll('a[href*="link.2gis.ru"]'), function (a) {
    a.setAttribute('rel', 'noopener');
    a.setAttribute('target', '_blank');
    if (!a.getAttribute('href')) a.setAttribute('href', BOOK);
  });

  /* ---------------- map pin: hide once user interacts with the map ---------------- */
  var pin = doc.querySelector('.map__pin');
  if (pin) {
    window.addEventListener('blur', function () { pin.style.display = 'none'; }, { once: true });
  }
})();
