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

// === デバッグ強化版：モバイル専用修正 ===
(function() {
  console.log('=== Header Debug Start ===');
  console.log('Window width:', window.innerWidth);
  console.log('Is mobile:', window.innerWidth <= 768);
  
  const header = document.querySelector('.header');
  console.log('Header element found:', !!header);
  if (header) {
    console.log('Header classes:', header.className);
  }
  
  const hasTransparentHeader = document.querySelector('[allow-transparent-header]');
  console.log('Transparent header element found:', !!hasTransparentHeader);
  
  // 透明ヘッダー要素をより広範囲で検索
  const altTransparentHeader = document.querySelector('[data-transparent-header]');
  console.log('Alternative transparent header found:', !!altTransparentHeader);
  
  // セクション要素も確認
  const firstSection = document.querySelector('.shopify-section:first-child');
  console.log('First section found:', !!firstSection);
  if (firstSection) {
    console.log('First section attributes:', firstSection.outerHTML.substring(0, 200));
  }
  
  // モバイルかつヘッダーが存在する場合
  if (header && window.innerWidth <= 768) {
    console.log('Attempting to remove is-solid class on mobile...');
    
    // 透明ヘッダー要素の有無に関係なく、モバイルでは一旦is-solidを除去
    const wasRemoved = header.classList.remove('is-solid');
    console.log('is-solid class removal result:', wasRemoved);
    console.log('Header classes after removal:', header.className);
    
    // 強制的にスタイルも設定
    header.style.backgroundColor = 'transparent';
    header.style.boxShadow = 'none';
    console.log('Transparent styles applied');
    
    // ロゴも強制的に非表示
    const logo = header.querySelector('.header__logo');
    if (logo) {
      logo.style.opacity = '0';
      logo.style.visibility = 'hidden';
      console.log('Logo hidden');
    }
  }
  
  console.log('=== Header Debug End ===');
})();