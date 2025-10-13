// === defer対応：DOMContentLoaded時点での確実な初期設定 ===
document.addEventListener('DOMContentLoaded', function() {
  // モバイル判定とヘッダー要素取得
  const isMobile = window.innerWidth <= 768;
  const header = document.querySelector('.header');
  const hasTransparentHeader = document.querySelector('[allow-transparent-header]');
  
  if (!header) return;
  
  // === 追加：マウスオーバー時のロゴ表示制御 ===
  if (hasTransparentHeader) {
    let isHovered = false;
    let isScrolled = false;
    
    // マウスオーバー状態を管理
    header.addEventListener('mouseenter', function() {
      isHovered = true;
      // 透明ヘッダー状態でマウスオーバー時にロゴ表示用のクラスを追加
      if (!header.classList.contains('is-solid')) {
        header.classList.add('header--hovered');
      }
    });
    
    header.addEventListener('mouseleave', function() {
      isHovered = false;
      // マウスアウト時にクラスを削除
      header.classList.remove('header--hovered');
    });
    
    // スクロール状態の変更を監視
    const scrollObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const currentlyScrolled = header.classList.contains('is-solid');
          if (isScrolled !== currentlyScrolled) {
            isScrolled = currentlyScrolled;
            // スクロール状態が変わった時にホバー状態をリセット
            if (isScrolled) {
              header.classList.remove('header--hovered');
            } else if (isHovered) {
              header.classList.add('header--hovered');
            }
          }
        }
      });
    });
    
    scrollObserver.observe(header, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
  
  // モバイルでの初期状態設定
  if (isMobile && hasTransparentHeader) {
    // is-solidクラスを除去
    header.classList.remove('is-solid');
    
    // MutationObserverでヘッダーの変更を監視
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // モバイルでis-solidクラスが追加された場合の処理
          if (header.classList.contains('is-solid') && window.scrollY < 300) {
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
  
  // === 既存のスクロール制御（統合版） ===
  const scrollTracker = document.getElementById('header-scroll-tracker');
  if (!scrollTracker) return;
  
  // カスタムスクロール閾値を設定
  const SCROLL_THRESHOLD = 300;
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
    // デスクトップでは通常の判定
    header.classList.toggle('is-solid', currentScrollY > SCROLL_THRESHOLD);
  }
});

// 設定変更用のグローバル関数
window.updateHeaderScrollThreshold = function(newThreshold) {
  const scrollTracker = document.getElementById('header-scroll-tracker');
  if (scrollTracker) {
    scrollTracker.style.top = `${newThreshold}px`;
  }
};

// === 最終保険：完全読み込み後のチェック ===
window.addEventListener('load', function() {
  // 少し遅延させて他のスクリプトの実行完了を待つ  
  setTimeout(function() {
    const isMobile = window.innerWidth <= 768;
    const header = document.querySelector('.header');
    const hasTransparentHeader = document.querySelector('[allow-transparent-header]');
    
    if (isMobile && header && hasTransparentHeader && window.scrollY < 300) {
      header.classList.remove('is-solid');
    }
  }, 200);
});
