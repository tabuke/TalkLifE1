/* =========================================================
   TALKLIFE — APP.JS
   Main frontend functionality
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {
  currentUser: {
    id: "user_001",
    name: "TalkLife User",
    username: "@talklife_user",
    avatar: "TL",
    bio: "Welcome to TalkLife 👋",
    followers: 0,
    following: 0,
    posts: 0
  },

  posts: [
    {
      id: "post_001",
      user: {
        name: "TalkLife AI",
        username: "@talklife_ai",
        avatar: "AI"
      },
      text:
        "Welcome to TalkLife 🎉 Share your life, connect with people and enjoy creative AI content.",
      likes: 124,
      comments: 18,
      shares: 9,
      liked: false,
      saved: false,
      type: "text",
      time: "2h"
    },

    {
      id: "post_002",
      user: {
        name: "Funny World",
        username: "@funnyworld",
        avatar: "FW"
      },
      text:
        "When your friend says: 'I will send the money tomorrow' 😂😂",
      likes: 387,
      comments: 42,
      shares: 31,
      liked: false,
      saved: false,
      type: "video",
      time: "4h"
    },

    {
      id: "post_003",
      user: {
        name: "Tech Daily",
        username: "@techdaily",
        avatar: "TD"
      },
      text:
        "Technology is changing every day. What technology are you most excited about? 🚀",
      likes: 205,
      comments: 27,
      shares: 12,
      liked: false,
      saved: false,
      type: "text",
      time: "6h"
    }
  ],

  notifications: [],

  currentPage: "home",

  searchQuery: "",

  isLoggedIn: false
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   STORAGE
   ========================================================= */

function saveState() {
  try {
    localStorage.setItem(
      "talklife_state",
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Could not save TalkLife state:", error);
  }
}


function loadState() {
  try {
    const saved = localStorage.getItem(
      "talklife_state"
    );

    if (!saved) return;

    const parsed = JSON.parse(saved);

    Object.assign(state, parsed);
  } catch (error) {
    console.warn("Could not load TalkLife state:", error);
  }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message,
  type = "success"
) {
  const oldToast =
    document.querySelector(".notification");

  if (oldToast) {
    oldToast.remove();
  }

  const toast =
    document.createElement("div");

  toast.className =
    `notification ${type}`;

  toast.innerHTML = `
    <span>
      ${
        type === "success"
          ? "✓"
          : type === "error"
          ? "!"
          : "i"
      }
    </span>

    <span>
      ${escapeHTML(message)}
    </span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform =
      "translateY(-10px)";

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 3000);
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function navigate(page) {
  state.currentPage = page;

  $$(".nav a").forEach(link => {
    link.classList.remove("active");

    if (
      link.dataset.page === page
    ) {
      link.classList.add("active");
    }
  });

  $$(".mobile-nav-item").forEach(item => {
    item.classList.remove("active");

    if (
      item.dataset.page === page
    ) {
      item.classList.add("active");
    }
  });

  const target =
    document.querySelector(
      `[data-section="${page}"]`
    );

  if (target) {
    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  saveState();
}


/* =========================================================
   POST RENDER
   ========================================================= */

function renderPosts(
  posts = state.posts
) {
  const feed =
    document.querySelector(".feed");

  if (!feed) return;

  feed.innerHTML = "";

  if (!posts.length) {
    feed.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔎</div>
        <h3>No posts found</h3>
        <p>
          Try another search.
        </p>
      </div>
    `;

    return;
  }

  posts.forEach(post => {
    feed.appendChild(
      createPostElement(post)
    );
  });

  attachPostEvents();
}


/* =========================================================
   CREATE POST ELEMENT
   ========================================================= */

function createPostElement(post) {
  const article =
    document.createElement("article");

  article.className =
    "post-card";

  article.dataset.postId =
    post.id;

  const media =
    post.type === "video"
      ? `
        <div class="post-video">
          <button
            class="video-play"
            data-action="play-video"
            aria-label="Play video"
          >
            ▶
          </button>
        </div>
      `
      : "";

  article.innerHTML = `
    <div class="post-header">

      <div class="post-user">

        <div class="avatar">
          ${escapeHTML(
            post.user.avatar
          )}
        </div>

        <div class="user-info">
          <strong>
            ${escapeHTML(
              post.user.name
            )}
          </strong>

          <span>
            ${escapeHTML(
              post.user.username
            )}
            · ${escapeHTML(post.time)}
          </span>
        </div>

      </div>

      <button
        class="post-menu"
        data-action="post-menu"
        aria-label="More options"
      >
        ⋯
      </button>

    </div>

    <div class="post-text">
      ${escapeHTML(post.text)}
    </div>

    ${media}

    <div class="post-actions">

      <button
        class="post-action ${
          post.liked ? "liked" : ""
        }"
        data-action="like"
      >
        ❤️
        <span>${post.likes}</span>
      </button>

      <button
        class="post-action"
        data-action="comment"
      >
        💬
        <span>${post.comments}</span>
      </button>

      <button
        class="post-action"
        data-action="share"
      >
        ↗
        <span>${post.shares}</span>
      </button>

      <button
        class="post-action ${
          post.saved ? "saved" : ""
        }"
        data-action="save"
      >
        🔖
      </button>

    </div>
  `;

  return article;
}


/* =========================================================
   POST EVENTS
   ========================================================= */

function attachPostEvents() {
  $$(".post-card").forEach(card => {

    card.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-action]"
          );

        if (!button) return;

        const action =
          button.dataset.action;

        const postId =
          card.dataset.postId;

        const post =
          state.posts.find(
            item =>
              item.id === postId
          );

        if (!post) return;

        switch (action) {

          case "like":
            toggleLike(post);
            break;

          case "comment":
            openComments(post);
            break;

          case "share":
            sharePost(post);
            break;

          case "save":
            toggleSave(post);
            break;

          case "play-video":
            playVideo(post);
            break;

          case "post-menu":
            openPostMenu(post);
            break;
        }
      }
    );
  });
}


/* =========================================================
   LIKE
   ========================================================= */

function toggleLike(post) {
  if (post.liked) {
    post.likes =
      Math.max(0, post.likes - 1);

    post.liked = false;

    showToast("Like removed");
  } else {
    post.likes++;

    post.liked = true;

    showToast("Post liked ❤️");
  }

  saveState();

  renderPosts(
    filterPosts(state.searchQuery)
  );
}


/* =========================================================
   SAVE
   ========================================================= */

function toggleSave(post) {
  post.saved = !post.saved;

  saveState();

  renderPosts(
    filterPosts(state.searchQuery)
  );

  showToast(
    post.saved
      ? "Post saved 🔖"
      : "Post removed from saved"
  );
}


/* =========================================================
   SHARE
   ========================================================= */

async function sharePost(post) {

  const shareText =
    `${post.text}\n\nShared from TalkLife`;

  try {

    if (
      navigator.share
    ) {

      await navigator.share({
        title: "TalkLife",
        text: shareText
      });

    } else if (
      navigator.clipboard
    ) {

      await navigator.clipboard.writeText(
        shareText
      );

      showToast(
        "Post copied to clipboard"
      );
    } else {

      showToast(
        "Share is not supported",
        "error"
      );
    }

    post.shares++;

    saveState();

  } catch (error) {
    console.log(
      "Share cancelled"
    );
  }
}


/* =========================================================
   COMMENTS
   ========================================================= */

function openComments(post) {

  const modal =
    createModal(
      "Comments",
      `
        <div
          id="comments-list"
          class="comments-list"
        >
          <div class="empty-state">
            <div class="empty-icon">💬</div>

            <h3>
              No comments yet
            </h3>

            <p>
              Be the first person
              to comment.
            </p>
          </div>
        </div>

        <div
          style="
            display:flex;
            gap:10px;
            margin-top:18px;
          "
        >
          <input
            id="comment-input"
            class="form-input"
            placeholder="Write a comment..."
          />

          <button
            id="comment-send"
            class="btn btn-primary"
          >
            Send
          </button>
        </div>
      `
    );

  document.body.appendChild(modal);

  const input =
    modal.querySelector(
      "#comment-input"
    );

  const send =
    modal.querySelector(
      "#comment-send"
    );

  send.addEventListener(
    "click",
    () => {

      const value =
        input.value.trim();

      if (!value) {
        showToast(
          "Write something first",
          "error"
        );

        return;
      }

      post.comments++;

      input.value = "";

      saveState();

      showToast(
        "Comment added 💬"
      );

      closeModal(modal);

      renderPosts(
        filterPosts(
          state.searchQuery
        )
      );
    }
  );
}


/* =========================================================
   PLAY VIDEO
   ========================================================= */

function playVideo(post) {

  const modal =
    createModal(
      "TalkLife Video",
      `
        <div
          style="
            aspect-ratio:9/16;
            background:#050505;
            border-radius:16px;
            display:flex;
            align-items:center;
            justify-content:center;
            position:relative;
            overflow:hidden;
          "
        >

          <div
            style="
              text-align:center;
              padding:25px;
            "
          >
            <div
              style="
                font-size:60px;
                margin-bottom:15px;
              "
            >
              ▶
            </div>

            <h3>
              ${escapeHTML(
                post.user.name
              )}
            </h3>

            <p
              style="
                color:#999;
                margin-top:8px;
              "
            >
              ${escapeHTML(
                post.text
              )}
            </p>
          </div>

        </div>
      `
    );

  document.body.appendChild(modal);
}


/* =========================================================
   POST MENU
   ========================================================= */

function openPostMenu(post) {

  const modal =
    createModal(
      "Post Options",
      `
        <div
          style="
            display:flex;
            flex-direction:column;
            gap:10px;
          "
        >

          <button
            class="btn btn-outline w-full"
            id="copy-post"
          >
            📋 Copy post
          </button>

          <button
            class="btn btn-outline w-full"
            id="report-post"
          >
            🚩 Report post
          </button>

          <button
            class="btn btn-outline w-full"
            id="cancel-post-menu"
          >
            Cancel
          </button>

        </div>
      `
    );

  document.body.appendChild(modal);

  modal
    .querySelector("#copy-post")
    .addEventListener(
      "click",
      async () => {

        try {

          await navigator.clipboard.writeText(
            post.text
          );

          showToast(
            "Post copied"
          );

          closeModal(modal);

        } catch {
          showToast(
            "Could not copy post",
            "error"
          );
        }
      }
    );

  modal
    .querySelector("#report-post")
    .addEventListener(
      "click",
      () => {

        showToast(
          "Report submitted"
        );

        closeModal(modal);
      }
    );

  modal
    .querySelector(
      "#cancel-post-menu"
    )
    .addEventListener(
      "click",
      () => {
        closeModal(modal);
      }
    );
}


/* =========================================================
   CREATE MODAL
   ========================================================= */

function createModal(
  title,
  content
) {

  const overlay =
    document.createElement("div");

  overlay.className =
    "modal-overlay";

  overlay.innerHTML = `
    <div class="modal">

      <div class="modal-header">

        <div class="modal-title">
          ${escapeHTML(title)}
        </div>

        <button
          class="modal-close"
          aria-label="Close"
        >
          ×
        </button>

      </div>

      <div class="modal-body">
        ${content}
      </div>

    </div>
  `;

  overlay
    .querySelector(".modal-close")
    .addEventListener(
      "click",
      () => closeModal(overlay)
    );

  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target === overlay
      ) {
        closeModal(overlay);
      }
    }
  );

  return overlay;
}


function closeModal(modal) {
  if (!modal) return;

  modal.remove();
}


/* =========================================================
   CREATE POST
   ========================================================= */

function openCreatePost() {

  const modal =
    createModal(
      "Create a Post",
      `
        <div class="form-group">

          <label
            class="form-label"
          >
            What's happening?
          </label>

          <textarea
            id="new-post-text"
            class="form-textarea"
            placeholder="Share something with TalkLife..."
          ></textarea>

        </div>

        <div
          style="
            display:flex;
            gap:10px;
          "
        >

          <button
            id="publish-post"
            class="btn btn-primary"
            style="flex:1;"
          >
            Publish
          </button>

          <button
            id="cancel-create"
            class="btn btn-outline"
          >
            Cancel
          </button>

        </div>
      `
    );

  document.body.appendChild(modal);

  modal
    .querySelector("#publish-post")
    .addEventListener(
      "click",
      () => {

        const textarea =
          modal.querySelector(
            "#new-post-text"
          );

        const text =
          textarea.value.trim();

        if (!text) {

          showToast(
            "Write something first",
            "error"
          );

          return;
        }

        const newPost = {
          id:
            "post_" +
            Date.now(),

          user: {
            name:
              state.currentUser.name,

            username:
              state.currentUser.username,

            avatar:
              state.currentUser.avatar
          },

          text,

          likes: 0,

          comments: 0,

          shares: 0,

          liked: false,

          saved: false,

          type: "text",

          time: "now"
        };

        state.posts.unshift(
          newPost
        );

        state.currentUser.posts++;

        saveState();

        closeModal(modal);

        renderPosts(
          filterPosts(
            state.searchQuery
          )
        );

        showToast(
          "Post published successfully 🎉"
        );
      }
    );

  modal
    .querySelector("#cancel-create")
    .addEventListener(
      "click",
      () => {
        closeModal(modal);
      }
    );
}


/* =========================================================
   SEARCH
   ========================================================= */

function filterPosts(query) {

  const clean =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!clean) {
    return state.posts;
  }

  return state.posts.filter(
    post =>
      post.text
        .toLowerCase()
        .includes(clean) ||

      post.user.name
        .toLowerCase()
        .includes(clean) ||

      post.user.username
        .toLowerCase()
        .includes(clean)
  );
}


function setupSearch() {

  const input =
    document.querySelector(
      ".search-box input"
    );

  if (!input) return;

  input.addEventListener(
    "input",
    event => {

      state.searchQuery =
        event.target.value;

      renderPosts(
        filterPosts(
          state.searchQuery
        )
      );
    }
  );
}


/* =========================================================
   LOGIN
   ========================================================= */

function openLogin() {

  const modal =
    createModal(
      "Login to TalkLife",
      `
        <form id="login-form">

          <div class="form-group">

            <label
              class="form-label"
            >
              Email
            </label>

            <input
              id="login-email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              required
            />

          </div>

          <div class="form-group">

            <label
              class="form-label"
            >
              Password
            </label>

            <input
              id="login-password"
              type="password"
              class="form-input"
              placeholder="Your password"
              required
            />

          </div>

          <button
            class="btn btn-primary w-full"
            type="submit"
          >
            Login
          </button>

        </form>
      `
    );

  document.body.appendChild(modal);

  modal
    .querySelector("#login-form")
    .addEventListener(
      "submit",
      event => {

        event.preventDefault();

        state.isLoggedIn = true;

        saveState();

        closeModal(modal);

        showToast(
          "Login successful 👋"
        );

        updateAuthUI();
      }
    );
}


/* =========================================================
   SIGN UP
   ========================================================= */

function openSignup() {

  const modal =
    createModal(
      "Create TalkLife Account",
      `
        <form id="signup-form">

          <div class="form-group">

            <label
              class="form-label"
            >
              Full name
            </label>

            <input
              id="signup-name"
              class="form-input"
              placeholder="Your full name"
              required
            />

          </div>

          <div class="form-group">

            <label
              class="form-label"
            >
              Username
            </label>

            <input
              id="signup-username"
              class="form-input"
              placeholder="@username"
              required
            />

          </div>

          <div class="form-group">

            <label
              class="form-label"
            >
              Email
            </label>

            <input
              id="signup-email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              required
            />

          </div>

          <div class="form-group">

            <label
              class="form-label"
            >
              Password
            </label>

            <input
              id="signup-password"
              type="password"
              class="form-input"
              placeholder="Create a password"
              required
            />

          </div>

          <button
            class="btn btn-primary w-full"
            type="submit"
          >
            Create Account
          </button>

        </form>
      `
    );

  document.body.appendChild(modal);

  modal
    .querySelector("#signup-form")
    .addEventListener(
      "submit",
      event => {

        event.preventDefault();

        const name =
          modal
            .querySelector(
              "#signup-name"
            )
            .value.trim();

        const username =
          modal
            .querySelector(
              "#signup-username"
            )
            .value.trim();

        if (!name || !username) {
          showToast(
            "Please complete all fields",
            "error"
          );

          return;
        }

        state.currentUser.name =
          name;

        state.currentUser.username =
          username.startsWith("@")
            ? username
            : "@" + username;

        state.currentUser.avatar =
          name
            .split(" ")
            .map(
              word =>
                word[0]
            )
            .join("")
            .substring(0, 2)
            .toUpperCase();

        state.isLoggedIn = true;

        saveState();

        closeModal(modal);

        updateAuthUI();

        showToast(
          "Account created successfully 🎉"
        );
      }
    );
}


/* =========================================================
   AUTH UI
   ========================================================= */

function updateAuthUI() {

  const loginButton =
    document.querySelector(
      "[data-action='login']"
    );

  const signupButton =
    document.querySelector(
      "[data-action='signup']"
    );

  if (
    state.isLoggedIn
  ) {

    if (loginButton) {
      loginButton.textContent =
        "Profile";
    }

    if (signupButton) {
      signupButton.textContent =
        "Create Post";

      signupButton.dataset.action =
        "create-post";
    }

  } else {

    if (loginButton) {
      loginButton.textContent =
        "Login";
    }

    if (signupButton) {
      signupButton.textContent =
        "Join TalkLife";
    }
  }
}


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

function setupGlobalActions() {

  document.addEventListener(
    "click",
    event => {

      const target =
        event.target.closest(
          "[data-action]"
        );

      if (!target) return;

      const action =
        target.dataset.action;

      if (
        action === "create-post"
      ) {
        openCreatePost();
      }

      if (
        action === "login"
      ) {
        openLogin();
      }

      if (
        action === "signup"
      ) {
        openSignup();
      }

      if (
        action === "profile"
      ) {
        openProfile();
      }

      if (
        action === "logout"
      ) {

        state.isLoggedIn =
          false;

        saveState();

        updateAuthUI();

        showToast(
          "You have been logged out"
        );
      }
    }
  );
}


/* =========================================================
   PROFILE
   ========================================================= */

function openProfile() {

  const user =
    state.currentUser;

  const modal =
    createModal(
      "My Profile",
      `
        <div
          style="
            text-align:center;
          "
        >

          <div
            class="profile-avatar"
            style="
              margin:0 auto 15px;
            "
          >
            ${escapeHTML(
              user.avatar
            )}
          </div>

          <h2>
            ${escapeHTML(
              user.name
            )}
          </h2>

          <p
            class="text-muted"
            style="margin-top:5px;"
          >
            ${escapeHTML(
              user.username
            )}
          </p>

          <p
            style="
              color:#ccc;
              margin:18px 0;
              line-height:1.6;
            "
          >
            ${escapeHTML(
              user.bio
            )}
          </p>

          <div
            style="
              display:grid;
              grid-template-columns:
                repeat(3,1fr);
              gap:10px;
            "
          >

            <div class="sidebar-card">
              <strong>
                ${user.posts}
              </strong>

              <div
                class="text-muted"
                style="font-size:12px;"
              >
                Posts
              </div>
            </div>

            <div class="sidebar-card">
              <strong>
                ${user.followers}
              </strong>

              <div
                class="text-muted"
                style="font-size:12px;"
              >
                Followers
              </div>
            </div>

            <div class="sidebar-card">
              <strong>
                ${user.following}
              </strong>

              <div
                class="text-muted"
                style="font-size:12px;"
              >
                Following
              </div>
            </div>

          </div>

        </div>
      `
    );

  document.body.appendChild(modal);
}


/* =========================================================
   AI VIDEOS
   ========================================================= */

const aiVideos = [
  {
    title:
      "When AI tries Nigerian slang 😂",
    description:
      "Funny AI-generated entertainment."
  },

  {
    title:
      "AI becomes a Nigerian comedian 🤣",
    description:
      "A creative AI comedy concept."
  },

  {
    title:
      "When your phone knows everything 😂",
    description:
      "Funny technology concept."
  },

  {
    title:
      "AI at a Nigerian wedding 😂",
    description:
      "Comedy concept generated for TalkLife."
  },

  {
    title:
      "When your friend owes you money 😭😂",
    description:
      "Relatable comedy content."
  }
];


function renderAIVideos() {

  const container =
    document.querySelector(
      ".ai-video-grid"
    );

  if (!container) return;

  container.innerHTML =
    aiVideos
      .map(
        (video, index) => `
          <div
            class="ai-video-card"
            data-ai-video="${index}"
          >

            <div
              class="ai-video-thumbnail"
            >

              <button
                class="ai-video-play"
                data-action="ai-video"
                data-index="${index}"
              >
                ▶
              </button>

            </div>

            <div
              class="ai-video-info"
            >

              <h3>
                ${escapeHTML(
                  video.title
                )}
              </h3>

              <p>
                ${escapeHTML(
                  video.description
                )}
              </p>

            </div>

          </div>
        `
      )
      .join("");

  container
    .addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-action='ai-video']"
          );

        if (!button) return;

        const index =
          Number(
            button.dataset.index
          );

        openAIVideo(
          aiVideos[index]
        );
      }
    );
}


function openAIVideo(video) {

  const modal =
    createModal(
      video.title,
      `
        <div
          style="
            aspect-ratio:9/16;
            border-radius:18px;
            background:
              linear-gradient(
                145deg,
                #101010,
                #252525
              );
            display:flex;
            align-items:center;
            justify-content:center;
            text-align:center;
            padding:25px;
          "
        >

          <div>

            <div
              style="
                font-size:55px;
                margin-bottom:15px;
              "
            >
              🤖
            </div>

            <h3>
              ${escapeHTML(
                video.title
              )}
            </h3>

            <p
              style="
                color:#999;
                margin-top:10px;
                line-height:1.6;
              "
            >
              ${escapeHTML(
                video.description
              )}
            </p>

          </div>

        </div>
      `
    );

  document.body.appendChild(modal);
}


/* =========================================================
   FOLLOW SYSTEM
   ========================================================= */

function followUser(
  userName
) {

  state.currentUser.following++;

  saveState();

  showToast(
    `You are now following ${userName}`
  );
}


/* =========================================================
   TRENDING
   ========================================================= */

function renderTrending() {

  const trends =
    document.querySelector(
      ".trending-list"
    );

  if (!trends) return;

  const items = [
    ["#TalkLife", "12.4K posts"],
    ["#FunnyVideos", "8.7K posts"],
    ["#AI", "6.2K posts"],
    ["#Nigeria", "5.8K posts"],
    ["#Technology", "4.1K posts"]
  ];

  trends.innerHTML =
    items
      .map(
        item => `
          <div class="trend">
            <strong>
              ${escapeHTML(item[0])}
            </strong>

            <span>
              ${escapeHTML(item[1])}
            </span>
          </div>
        `
      )
      .join("");
}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function setupKeyboardShortcuts() {

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "/" &&
        document.activeElement.tagName !==
          "INPUT" &&
        document.activeElement.tagName !==
          "TEXTAREA"
      ) {

        event.preventDefault();

        const search =
          document.querySelector(
            ".search-box input"
          );

        if (search) {
          search.focus();
        }
      }

      if (
        event.key === "Escape"
      ) {

        const modal =
          document.querySelector(
            ".modal-overlay"
          );

        if (modal) {
          closeModal(modal);
        }
      }
    }
  );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeTalkLife() {

  loadState();

  renderPosts(
    filterPosts(
      state.searchQuery
    )
  );

  renderAIVideos();

  renderTrending();

  setupSearch();

  setupGlobalActions();

  setupKeyboardShortcuts();

  updateAuthUI();

  console.log(
    "%cTalkLife loaded successfully 🚀",
    "color:#ffd21f;font-size:16px;font-weight:bold;"
  );
}


/* =========================================================
   START APP
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeTalkLife
  );

} else {

  initializeTalkLife();

}
