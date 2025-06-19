import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";
  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="add-post-container">
          <h3>Добавить новый пост</h3>
          <div class="upload-image-container"></div>
          <textarea class="post-description" placeholder="Введите описание"></textarea>
          <button class="button" id="add-button" disabled>Добавить</button>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container"),
      onImageUrlChange(newImageUrl) {
        imageUrl = newImageUrl;
        document.getElementById("add-button").disabled = !imageUrl;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      const description = document.querySelector(".post-description").value.trim();
      
      if (!imageUrl) {
        alert("Пожалуйста, загрузите изображение.");
        return;
      }
      
      if (!description) {
        alert("Введите описание.");
        return;
      }
      
      onAddPostClick({ description, imageUrl });
    });
  };

  render();
}
