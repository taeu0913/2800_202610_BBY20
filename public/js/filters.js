const filterGroups = document.querySelectorAll('.filter-group');

filterGroups.forEach(group => {

    const button = group.querySelector('.filter-toggle');

    const menu = group.querySelector('.advanced-menu');

    button.addEventListener('click', () => {

        // close other menus
        document.querySelectorAll('.advanced-menu').forEach(item => {

            if (item !== menu) {

                item.style.display = 'none';

            }

        });

        // toggle current menu
        if (menu.style.display === 'block') {

            menu.style.display = 'none';

        } else {

            menu.style.display = 'block';

        }

    });

});