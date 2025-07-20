class Modal {
    constructor(title, text, cb = {}) {
        this.title = title;
        this.text = text;

        this.cb = {
            close: cb.onClose ?? this.onClose,
        };

        this.show();
    }

    onClose(modal, openLink) {
        modal.remove();
        openLink.remove();
    }

    show() {
        let openLink = document.createElement('a'),
            contentContainer = document.createElement('div'),
            modal = document.createElement('div'),
            h1 = document.createElement('h1'),
            text = document.createElement('span'),
            content = [],
            closeBtn = document.createElement('a');

        openLink.href = '#open-modal';
        openLink.style.display = 'none;'

        closeBtn.classList.add('modal-close');
        closeBtn.innerText = 'Close';
        closeBtn.href = '#';

        closeBtn.addEventListener('click',  () => {
            this.cb.close(modal, openLink);
        });

        h1.innerText = this.title;
        text.innerText = this.text;

        content.push(closeBtn, h1, text);

        modal.id = 'open-modal';
        modal.classList.add('modal-window');

        contentContainer.append(...content);
        modal.append(contentContainer);

        document.body.append(modal);
        document.body.append(openLink);

        openLink.click();
    }
}
