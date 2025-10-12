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




//
var initPhotoSwipeFromDOM = function( gallerySelector ) {

    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        if(!params.hasOwnProperty('pid')) {
            return params;
        }
        params.pid = parseInt(params.pid, 10);
        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {
            index: index,

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid > 0 && hashData.gid > 0) {
        openPhotoSwipe( hashData.pid - 1 ,  galleryElements[ hashData.gid - 1 ], true );
    }
};


//PhotoSwipe
initPhotoSwipeFromDOM( '.my-gallery' ) ;



//look modal
const modalWrapper = document.querySelector('.look-modal-wrapper');
const images = document.querySelectorAll('.look-image');
const modalImage = document.querySelector('.look-modal-image');

images.forEach(function(image) {
image.addEventListener('click', function() {
    modalWrapper.classList.add('show');
    modalImage.classList.add('show');

    var imageSrc = image.getAttribute('data-src');
    modalImage.src = imageSrc;
});
});

modalWrapper.addEventListener('click', function() {
if (this.classList.contains('show')) {
    this.classList.remove('show');
    modalImage.classList.remove('show');
}
});