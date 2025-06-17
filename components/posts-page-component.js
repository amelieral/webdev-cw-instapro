import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { getPosts, toggleLike, postsHost } from "../api.js";
import { goToPage, user } from "../index.js";

export function renderPostsPageComponent({ appEl, token, userId }) {
  console.log("Загружаем...");

  getPosts({ token })
    .then((posts) => {
      console.log("Список постов:", posts);

      let filteredPosts = posts
      if (userId) {
        filteredPosts = posts.filter((post) => post.user.id === userId)
      }

      const postsHtml = filteredPosts
        .map((post) => {
          const likesDisplay =
            post.likes && Array.isArray(post.likes) && post.likes.length > 0
              ? post.likes.map((user) => user.name).join(", ")
              : "0";

          return `
          <li class="post">
            <div class="post-header" data-user-id="${post.user.id}">
                <img src="${
                  post.user.imageUrl
                }" class="post-header__user-image">
                <p class="post-header__user-name">${post.user.name}</p>
            </div>
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}">
            </div>
            <div class="post-likes">
              <button data-post-id="${post.id}" data-is-liked="${
            post.isLiked
          }" class="like-button">
                <img src="./assets/images/${
                  post.isLiked ? "like-active.svg" : "like-not-active.svg"
                }">
              </button>
              <p class="post-likes-text">
                Нравится: <strong>${likesDisplay}</strong>
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${post.user.name}</span>
              ${post.description}
            </p>
          </li>`;
        })
        .join("");

      appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <ul class="posts">
          ${postsHtml}
        </ul>
      </div>`;

      renderHeaderComponent({
        element: document.querySelector(".header-container"),
      });

      document.querySelectorAll(".post-header").forEach((userEl) => {
        userEl.addEventListener("click", () => {
          goToPage(USER_POSTS_PAGE, {
            userId: userEl.dataset.userId,
          });
        });
      });

      document.querySelectorAll(".like-button").forEach((button) => {
        button.addEventListener("click", () => {
          const postId = button.dataset.postId;
          const isLiked = button.dataset.isLiked === "true";
          console.log(
            "Нажат лайк:",
            postId,
            "Текущий статус:",
            isLiked
          );

          toggleLike({ token, postId, isLiked })
            .then((updatedPost) => {
              console.log("Обновленный пост:", updatedPost);
              updatedPostUI(updatedPost);
            })
            .catch((error) => {
              console.error("Ошибка лайка:", error);
              alert(error.message);
            });
        });
      });

      function updatedPostUI(updatedPost) {
        const button = document.querySelector(
          `.like-button[data-post-id="${updatedPost.id}"]`
        );
        if (button) {
          button.dataset.isLiked = updatedPost.isLiked;
          const imgEl = button.querySelector("img");
          if (imgEl) {
            imgEl.src = `./assets/images/${
              updatedPost.isLiked ? "like-active.svg" : "like-not-active.svg"
            }`;
          }
        }

        const postli = button.closest("li");
        if (postli) {
          const likesTextEl = postli.querySelector(".post-likes-text strong");
          if (likesTextEl) {
            const likedUsers =
              updatedPost.likes &&
              Array.isArray(updatedPost.likes) &&
              updatedPost.likes.length > 0
                ? updatedPost.likes.map((user) => user.name).join(", ")
                : "";
            likesTextEl.textContent = likedUsers;
          }
        }
      }
    })
    .catch((error) => {
      console.error("Ошибка загрузки постов:", error);
      appEl.innerHTML = `<p class="error-message">Ошибка загрузки постов: ${error.message}</p>`;
    });
}
