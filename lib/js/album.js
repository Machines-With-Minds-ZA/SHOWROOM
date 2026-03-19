AOS.init({ duration: 800, easing: 'slide', once: true });

    $(document).ready(function() {
        const urlParams = new URLSearchParams(window.location.search);
        const albumId = urlParams.get('id');
        const IMAGES_PER_PAGE = 50; // Load 50 images at a time for fast rendering

        if (!albumId) { console.error("No album ID"); return; }

        $.getJSON('assets/json/data.json', function(data) {
            const album = data.albums.find(a => a.id === albumId);
            if (album) renderAlbum(album);
            else $('#gallery-container').html('<p>Album not found.</p>');
        });

        function renderAlbum(album) {
            $('#album-title').text(album.title);
            const container = $('#gallery-container');
            container.empty();

            const totalImages = album.images.length;
            let currentPage = 0;
            let $grid = null;

            function createGallery() {
                const galleryWarp = $('<div class="gallery-warp"><div class="grid-sizer"></div></div>');
                const startIdx = currentPage * IMAGES_PER_PAGE;
                const endIdx = Math.min(startIdx + IMAGES_PER_PAGE, totalImages);

                for (let i = startIdx; i < endIdx; i++) {
                    const imgObj = album.images[i];
                    const src = typeof imgObj === 'string' ? imgObj : imgObj.src;
                    let sizeClass = ''; 
                    const rand = Math.random();
                    
                    // Random Sizes
                    if (rand < 0.20) sizeClass = 'gi-big';      // 20% Big
                    else if (rand < 0.40) sizeClass = 'gi-wide'; // 20% Wide
                    // 60% Small (High count of small items helps fill gaps!)

                    const html = `
                     <div class="gallery-item ${sizeClass} item" data-src="${src}" data-sub-html="<h4>${album.title}</h4>">
                         <a href="#"><img src="${src}" alt="Image" loading="lazy"></a>
                     </div>`;
                    galleryWarp.append(html);
                }

                if (currentPage === 0) {
                    container.append(galleryWarp);
                    $grid = galleryWarp;
                } else {
                    $grid.append(galleryWarp.children('.gallery-item'));
                }
                
                // INITIALIZE WITH PACKERY MODE
                const gridItems = $grid.hasClass('gallery-warp') ? $grid : $grid.parent();
                const $mainGrid = gridItems.closest('.gallery-warp').length ? gridItems.closest('.gallery-warp') : $grid;
                
                if (currentPage === 0) {
                    $mainGrid.isotope({
                        itemSelector: '.gallery-item',
                        percentPosition: true,
                        layoutMode: 'packery',
                        packery: {
                            columnWidth: '.grid-sizer',
                            gutter: 0
                        }
                    });
                    $mainGrid.lightGallery({ selector: '.item' });
                }

                $mainGrid.imagesLoaded().progress(function() {
                    $mainGrid.isotope('reloadItems').isotope();
                });

                // Load more button/auto-load
                if (endIdx < totalImages) {
                    currentPage++;
                    // Auto-load next batch after a short delay for better UX
                    setTimeout(createGallery, 500);
                }
            }

            createGallery();
        }
    });    