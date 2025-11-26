// Initialize AOS
    AOS.init({
      duration: 800,
      easing: 'slide',
      once: true
    });

    $(document).ready(function() {
        let albumsData = [];

        // Load Data
        $.getJSON('../../assets/json/data.json', function(data) {
            albumsData = data.albums;
            renderAlbums();
        });

        function renderAlbums() {
            const container = $('#gallery-container');
            container.empty();
            $('#back-btn').hide();

            if (!albumsData) return;

            albumsData.forEach(album => {
                const html = `
                  <div class="album-card">
                    <a href="album.html?id=${album.id}" class="album-link" aria-label="Open album ${album.title}">
                      <div class="crop">
                        <img src="${album.cover}" alt="${album.title} cover" loading="lazy" />
                      </div>
                      <div class="album-info">
                        <div class="album-title">${album.title}</div>
                        <div class="overlay-icon">
                            <span class="material-symbols-outlined">
                                art_track
                            </span>
                        </div>
                      </div>
                    </a>
                  </div>
                `;
                container.append(html);
            });
        }
    });