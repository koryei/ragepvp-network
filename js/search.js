$(() => {
    let searchInput = $('#search-input');
    let searchDropdown = $('#search-dropdown');
    searchDropdown.empty();
    $('#search-dropdown.dropdown-item').click(function () {
        console.debug($(this).attr('href'));
    });
    searchInput.focusin(function () {
        searchDropdown.addClass('show');
    });
    searchInput.focusout(function () {
        setTimeout(() => {
            searchDropdown.removeClass('show');
        }, 200);
    });
    $('#search-button').click(function () {
        searchDropdown.toggleClass('show');
    });
    $('#loginDropdown').click(function (e) {
        e.preventDefault();
    });
    function safeUsername(value) {
        let username = String(value || '');
        return /^[A-Za-z0-9_]{1,16}$/.test(username) ? username : null;
    }
    function safePlayerUrl(element, username) {
        let expected = '/player/' + encodeURIComponent(username);
        return element && element.url === expected ? expected : null;
    }
    function safeImageUrl(value) {
        try {
            let url = new URL(String(value || ''), window.location.origin);
            if (url.protocol !== 'https:' || url.hostname !== 'skins.mcstats.com') return null;
            if (!url.pathname.match(/^\/face\/[a-fA-F0-9-]+$/)) return null;
            return url.toString();
        } catch (e) {
            return null;
        }
    }
    function appendUser(element) {
        let username = safeUsername(element && element.username);
        if (!username) return;
        let href = safePlayerUrl(element, username);
        let image = safeImageUrl(element && element.image);
        if (!href || !image) return;

        let link = document.createElement('a');
        link.className = 'dropdown-item';
        link.href = href;

        let label = document.createElement('span');
        label.style.color = '#000000';
        label.textContent = username;

        let avatar = document.createElement('img');
        avatar.className = 'float-right';
        avatar.src = image;
        avatar.alt = username;

        link.append(label, document.createTextNode(' '), avatar);
        searchDropdown.append(link);
    }
    let searchTimeout;
    searchInput.on('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            let username = safeUsername($(this).val());
            if (username) {
                clearTimeout(searchTimeout);
                searchDropdown.removeClass('show');
                searchInput.blur();
                window.navigate('/player/' + encodeURIComponent(username));
            }
        }
    });
    searchInput.on('input', function () {
        clearTimeout(searchTimeout);
        let text = $(this).val();
        if (!text || text.length <= 1) {
            searchDropdown.removeClass('show');
            return;
        }
        searchTimeout = setTimeout(() => search(text), 250);
    });
    function search(text) {
        $.get({
            url: `/search/${encodeURIComponent(text)}`,
            dataType: 'json',
            cache: true,
            success: (res) => {
                let dropDown = $('#search-dropdown');
                dropDown.empty();
                if (res.status === 'success') {
                    res.response.forEach(element => {
                        appendUser(element)
                    });
                    searchDropdown.addClass('show');
                }
            },
            error: () => console.error('error searching')
        });
    }
});
