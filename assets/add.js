// 既存のヘッダースクロール制御の追加設定（変更なし）
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

// === モバイル専用：強制的に透明ヘッダー設定 ===
if (window.innerWidth <= 768) {
  // モバイルでのみ実行
  const header = document.querySelector('.header');
  if (header) {
    // is-solidクラスを除去
    header.classList.remove('is-solid');
    
    // 透明背景を強制設定
    header.style.setProperty('background-color', 'transparent', 'important');
    header.style.setProperty('box-shadow', 'none', 'important');
    header.style.setProperty('backdrop-filter', 'none', 'important');
    
    // ロゴを非表示
    const logo = header.querySelector('.header__logo');
    if (logo) {
      logo.style.setProperty('opacity', '0', 'important');
      logo.style.setProperty('visibility', 'hidden', 'important');
    }
  }
}