// 既存のヘッダースクロール制御の追加設定
document.addEventListener('DOMContentLoaded', function() {
  // カスタムスクロール閾値を設定（ピクセル単位）
  const SCROLL_THRESHOLD = 300; // この値を調整してスクロール位置を変更可能
  
  // ヘッダー要素を取得
  const header = document.querySelector('.header');
  const scrollTracker = document.getElementById('header-scroll-tracker');
  
  if (!header || !scrollTracker) return;
  
  // スクロールトラッカーの位置を動的に更新
  scrollTracker.style.top = `${SCROLL_THRESHOLD}px`;
  
  // 透明ヘッダーが有効かチェック
  const hasTransparentHeader = document.querySelector('[allow-transparent-header]');
  if (!hasTransparentHeader) return;
  
  // IntersectionObserverでスクロール位置を監視
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.target === scrollTracker) {
        // スクロールトラッカーが見えなくなったら通常ヘッダーに切り替え
        header.classList.toggle('is-solid', !entry.isIntersecting);
        
        // デバッグ用コンソール出力（本番では削除可能）
        console.log('Header solid state:', !entry.isIntersecting);
      }
    });
  }, {
    threshold: 0,
    rootMargin: '0px'
  });
  
  observer.observe(scrollTracker);
  
  // 初期状態の設定
  const currentScrollY = window.scrollY;
  header.classList.toggle('is-solid', currentScrollY > SCROLL_THRESHOLD);
});

// 設定変更用のグローバル関数（テーマカスタマイザーから使用可能）
window.updateHeaderScrollThreshold = function(newThreshold) {
  const scrollTracker = document.getElementById('header-scroll-tracker');
  if (scrollTracker) {
    scrollTracker.style.top = `${newThreshold}px`;
  }
};

// === バグ修正のための追加コード ===

// 初期読み込み時のヘッダー状態を即座に設定
(function() {
  'use strict';

  // ページ読み込み前の初期設定
  function setInitialHeaderState() {
    const header = document.querySelector('.header');
    const hasTransparentHeader = document.querySelector('[allow-transparent-header]');
    
    if (!header) return;

    if (hasTransparentHeader) {
      // 透明ヘッダーの初期状態を設定
      header.classList.remove('is-solid');
      header.style.backgroundColor = 'transparent';
      header.style.boxShadow = 'none';
      
      // ロゴを非表示
      const logo = header.querySelector('.header__logo');
      if (logo) {
        logo.style.opacity = '0';
        logo.style.visibility = 'hidden';
        logo.style.transition = 'opacity 0s ease, visibility 0s ease';
      }
    } else {
      // 通常ヘッダーの初期状態を設定
      header.classList.add('is-solid');
      
      // ロゴを表示
      const logo = header.querySelector('.header__logo');
      if (logo) {
        logo.style.opacity = '1';
        logo.style.visibility = 'visible';
      }
    }
  }

  // 即座に実行（DOMContentLoadedを待たない）
  setInitialHeaderState();

  // DOMContentLoaded後にも再実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setInitialHeaderState);
  }

  // Shopifyの動的セクション読み込み時にも対応
  document.addEventListener('shopify:section:load', setInitialHeaderState);

  // ページ完全読み込み後の最終チェック
  window.addEventListener('load', function() {
    setTimeout(setInitialHeaderState, 50);
  });

})();

// ヘッダー設定のリアルタイム更新（テーマカスタマイザー用）
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', function(event) {
    if (event.target.querySelector('.header')) {
      // ヘッダーセクションが更新された時の処理
      setTimeout(function() {
        const header = document.querySelector('.header');
        const hasTransparentHeader = document.querySelector('[allow-transparent-header]');
        
        if (header && hasTransparentHeader) {
          header.classList.remove('is-solid');
          const logo = header.querySelector('.header__logo');
          if (logo) {
            logo.style.opacity = '0';
            logo.style.visibility = 'hidden';
          }
        }
      }, 100);
    }
  });
}