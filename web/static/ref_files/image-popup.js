const popupStyle = () => `
    left: 0; top: 0;
    height: 100%; width: 100%;
    position: fixed; display: flex;
    background-color: rgba(255, 255, 255, 1);
    justify-content: center; align-items: center;
    z-index: 2;
`;

const closeBtnStyle = `  
    top: 0; right: 15px;
    position: absolute;
    font-size: 50px;
    cursor: pointer;  
`;

const createPopup = (element) => {
    const container = document.querySelector("#chat-messages-block");
    const image = document.createElement("img");
    const popup = document.createElement("div");
    const imageContainer = document.createElement("div");

    imageContainer.style = "display: flex; max-height: 85vh;";
    image.style = "max-width: 90%;max-height: 100%; margin: 0 auto; object-fit: contain;";
    popup.style = popupStyle();
    image.setAttribute("src", element.src);

    popup.onclick = () => {
        popup.remove();
    };

    container.append(popup);
    imageContainer.append(image);
    popup.append(imageContainer);
};

const initImageListeners = () => {
    const images = document.querySelectorAll("#chat-messages-list .zoom-in");
    images.forEach((img) => (img.onclick = (event) => createPopup(event.target)));
};