import { getPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { postsHost } from "./api.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
return user ? `Bearer ${user.token}` : undefined;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      return renderPostsPageComponent({
        appEl: document.getElementById("app"),
        token: getToken(),
        userId: data.userId,
      });
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");
  

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },

    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
 const token = getToken();

        console.log("user.token:", user.token);
        console.log("getToken():", token);

        if (!token) {
          alert("Вам нужно авторизоваться, чтобы добавить пост.");
          return;
        }

        if (!description.trim()) {
          alert("Добавьте описание.");
          return;
        }

        if (!imageUrl) {
          alert("Пожалуйста, загрузите изображение.");
          return;
        }

        console.log("Отправляем пост...");
        console.log("Описание:", description);
        console.log("URL картинки:", imageUrl);
        console.log("Token:", getToken());

        fetch(postsHost, {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: JSON.stringify({
            description: description,
            imageUrl: imageUrl,
          }), 
        })
          .then(async (response) => {
            console.log("Ответ сервера при добавлении поста:", response);
            if (!response.ok) {
              throw new Error(
                `Ошибка при добавлении поста: ${response.status}`
              );
            }

            console.log("Пост успешно добавлен!");
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error("Ошибка:", error);
            alert(error.message);
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
      token: getToken(),
    });
  }
};

goToPage(POSTS_PAGE);
