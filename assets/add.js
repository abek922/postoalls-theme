// === defer対応：DOMContentLoaded時点での確実な初期設定 ===
document.addEventListener('DOMContentLoaded', function() {
  // モバイル判定とヘッダー要素取得
  const isMobile = window.innerWidth <= 768;
  const header = document.querySelector('.header');
  const hasTransparentHeader = document.querySelector('[allow-transparent-header]');
  
  if (!header) return;
  
  // 管理画面設定値を取得（CSS変数から）
  const rootStyles = getComputedStyle(document.documentElement);
  const thresholdFromCSS = rootStyles.getPropertyValue('--header-scroll-tracker-offset');
  const SCROLL_THRESHOLD = thresholdFromCSS ? parseInt(thresholdFromCSS) : 300;
  
  console.log('Scroll threshold from settings:', SCROLL_THRESHOLD);
  
  // モバイルでの初期状態設定
  if (isMobile && hasTransparentHeader) {
    // is-solidクラスを除去
    header.classList.remove('is-solid');
    
    // MutationObserverでヘッダーの変更を監視
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // モバイルでis-solidクラスが追加された場合の処理
          if (header.classList.contains('is-solid') && window.scrollY < SCROLL_THRESHOLD) {
            header.classList.remove('is-solid');
          }
        }
      });
    });
    
    observer.observe(header, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
  
  // === 既存のスクロール制御（設定値対応版） ===
  const scrollTracker = document.getElementById('header-scroll-tracker');
  if (!scrollTracker) return;
  
  // 管理画面の設定値でスクロールトラッカーの位置を設定
  scrollTracker.style.top = `${SCROLL_THRESHOLD}px`;
  
  if (!hasTransparentHeader) return;
  
  // IntersectionObserverでスクロール位置を監視
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === scrollTracker) {
        header.classList.toggle('is-solid', !entry.isIntersecting);
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px'
  });
  
  scrollObserver.observe(scrollTracker);
  
  // 初期状態の設定
  const currentScrollY = window.scrollY;
  if (isMobile && hasTransparentHeader) {
    // モバイルでは初期状態を透明に
    header.classList.remove('is-solid');
  } else {
    // デスクトップでは設定値に基づいて判定
    header.classList.toggle('is-solid', currentScrollY > SCROLL_THRESHOLD);
  }
});

// 設定変更用のグローバル関数（管理画面からの動的更新対応）
window.updateHeaderScrollThreshold = function(newThreshold) {
  const scrollTracker = document.getElementById('header-scroll-tracker');
  if (scrollTracker) {
    scrollTracker.style.top = `${newThreshold}px`;
  }
  
  // CSS変数も更新
  document.documentElement.style.setProperty('--header-scroll-tracker-offset', `${newThreshold}px`);
  
  console.log('Header scroll threshold updated to:', newThreshold);
};

// === 最終保険：完全読み込み後のチェック ===
window.addEventListener('load', function() {
  // 少し遅延させて他のスクリプトの実行完了を待つ  
  setTimeout(function() {
    const isMobile = window.innerWidth <= 768;
    const header = document.querySelector('.header');
    const hasTransparentHeader = document.querySelector('[allow-transparent-header]');
    
    // 設定値を再取得
    const rootStyles = getComputedStyle(document.documentElement);
    const thresholdFromCSS = rootStyles.getPropertyValue('--header-scroll-tracker-offset');
    const SCROLL_THRESHOLD = thresholdFromCSS ? parseInt(thresholdFromCSS) : 300;
    
    if (isMobile && header && hasTransparentHeader && window.scrollY < SCROLL_THRESHOLD) {
      header.classList.remove('is-solid');
    }
  }, 200);
});