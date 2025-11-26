AOS.init({ duration: 800, easing: 'slide', once: true });

    $(document).ready(function() {
        const urlParams = new URLSearchParams(window.location.search);
        const albumId = urlParams.get('id');

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

            const galleryWarp = $('<div class="gallery-warp"><div class="grid-sizer"></div></div>');

            album.images.forEach((imgObj) => {
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
            });
            
            container.append(galleryWarp);
            
            // INITIALIZE WITH PACKERY MODE
            const $grid = galleryWarp.isotope({
                itemSelector: '.gallery-item',
                percentPosition: true,
                layoutMode: 'packery', // GREEDY PLACEMENT
                packery: {
                    columnWidth: '.grid-sizer',
                    gutter: 0 // We handle gaps via CSS Padding
                }
            });

            $grid.imagesLoaded().progress( function() {
                $grid.isotope('layout');
            });
            
            galleryWarp.lightGallery({ selector: '.item' });
        }
    });    