// ヘッダースクロール制御の追加設定
document.addEventListener('DOMContentLoaded', function() {
  // カスタムスクロール閾値を設定（ピクセル単位）
  const SCROLL_THRESHOLD = 2800; // この値を調整してスクロール位置を変更可能
  
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