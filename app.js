"use strict";

/* =========================================================
   TALKLIFE — APP.JS
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
        "When your friend says: I will send the money tomorrow 😂😂",
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

  searchQuery: "",
  currentPage: "home",
  isLoggedIn: false
};


/* =========================================================
   HELPERS
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function saveState() {
  try {
    localStorage.setItem(
      "talklife_state",
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Storage error:", error);
  }
}

function loadState() {
  try {
    const saved =
      localStorage.getItem("talklife_state");

    if (!saved) return;

    const parsed = JSON.parse(saved);

    Object.assign(state, parsed);
  } catch (error) {
    console.warn("Could not load saved state:", error);
  }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
  message,
  type = "success"
) {
  const old =
    document.querySelector(".notification");

  if (old) old.remove();

  const toast =
    document.createElement("div");

  toast.className =
    `notification ${type}`;

  toast.innerHTML = `
    <span style="font-weight:900;">
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

    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 2800);
}


/* =========================================================
   POST FILTER
   ========================================================= */

function filterPosts(query) {
  const clean =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!clean) {
    return state.posts;
  }

  return state.posts.filter(post => {
    return (
      post.text.toLowerCase().includes(clean) ||
      post.user.name.toLowerCase().includes(clean) ||
      post.user.username.toLowerCase().includes(clean)
    );
  });
}


/* =========================================================
   RENDER POSTS
   ========================================================= */

function renderPosts(posts = state.posts) {
  const feed = $(".feed");

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
}


/* =========================================================
   CREATE POST ELEMENT
   ========================================================= */

function createPostElement(post) {
  const article =
    document.createElement("article");

  article.className = "post-card";

  article.dataset.postId = post.id;

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
          ${escapeHTML(post.user.avatar)}
        </div>

        <div class="user-info">

          <strong>
            ${escapeHTML(post.user.name)}
          </strong>

          <span>
            ${escapeHTML(post.user.username)}
            ·
            ${escapeHTML(post.time)}
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
   POST ACTIONS
   ========================================================= */

document.addEventListener("click", event => {
  const button =
    event.target.closest("[data-action]");

  if (!button) return;

  const action =
    button.dataset.action;

  const card =
    button.closest(".post-card");

  const postId =
    card?.dataset.postId;

  const post =
    state.posts.find(
      item => item.id === postId
    );

  switch (action) {

    case "like":
      if (post) toggleLike(post);
      break;

    case "comment":
      if (post) openComments(post);
      break;

    case "share":
      if (post) sharePost(post);
      break;

    case "save":
      if (post) toggleSave(post);
      break;

    case "play-video":
      if (post) playVideo(post);
      break;

    case "post-menu":
      if (post) openPostMenu(post);
      break;

    case "create-post":
      openCreatePost();
      break;

    case "login":
      openLogin();
      break;

    case "signup":
      openSignup();
      break;

    case "profile":
      openProfile();
      break;

    case "logout":
      logout();
      break;
  }
});


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

  const text =
    `${post.text}\n\nShared from TalkLife`;

  try {

    if (navigator.share) {

      await navigator.share({
        title: "TalkLife",
        text
      });

    } else if (navigator.clipboard) {

      await navigator.clipboard.writeText(text);

      showToast(
        "Post copied to clipboard"
      );

    } else {

      showToast(
        "Sharing is not supported",
        "error"
      );

    }

    post.shares++;

    saveState();

    renderPosts(
      filterPosts(state.searchQuery)
    );

  } catch {
    console.log("Share cancelled");
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
            <div class="empty-icon">
              💬
            </div>

            <h3>
              No comments yet
            </h3>

            <p>
              Be the first to comment.
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
    modal.querySelector("#comment-input");

  const send =
    modal.querySelector("#comment-send");

  send.addEventListener(
    "click",
    () => {

      const text =
        input.value.trim();

      if (!text) {
        showToast(
          "Write a comment first",
          "error"
        );

        return;
      }

      post.comments++;

      saveState();

      closeModal(modal);

      renderPosts(
        filterPosts(state.searchQuery)
      );

      showToast(
        "Comment added 💬"
      );
    }
  );
}


/* =========================================================
   VIDEO
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
            border-radius:18px;
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
                font-size:60px;
                margin-bottom:15px;
              "
            >
              ▶
            </div>

            <h3>
              ${escapeHTML(post.user.name)}
            </h3>

            <p
              style="
                color:#999;
                margin-top:10px;
                line-height:1.6;
              "
            >
              ${escapeHTML(post.text)}
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
            id="copy-post"
            class="btn btn-outline w-full"
          >
            📋 Copy Post
          </button>

          <button
            id="report-post"
            class="btn btn-outline w-full"
          >
            🚩 Report Post
          </button>

          <button
            id="close-menu"
            class="btn btn-outline w-full"
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

          showToast("Post copied");

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
    .querySelector("#close-menu")
    .addEventListener(
      "click",
      () => closeModal(modal)
    );
}


/* =========================================================
   MODAL
   ========================================================= */

function createModal(title, content) {

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

          <label class="form-label">
            What's happening?
          </label>

          <textarea
            id="new-post-text"
            class="form-textarea"
            placeholder="Share something with TalkLife..."
          ></textarea>

        </div>

        <button
          id="publish-post"
          class="btn btn-primary w-full"
        >
          Publish Post
        </button>
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

        const post = {
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

        state.posts.unshift(post);

        state.currentUser.posts++;

        saveState();

        closeModal(modal);

        renderPosts(
          filterPosts(
            state.searchQuery
          )
        );

        showToast(
          "Post published 🎉"
        );
      }
    );
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

  const input =
    $(".search-box input");

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

            <label class="form-label">
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

            <label class="form-label">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              class="form-input"
              placeholder="Password"
              required
            />

          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
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

        updateAuthUI();

        showToast(
          "Login successful 👋"
        );
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

            <label class="form-label">
              Full Name
            </label>

            <input
              id="signup-name"
              class="form-input"
              placeholder="Your full name"
              required
            />

          </div>

          <div class="form-group">

            <label class="form-label">
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

            <label class="form-label">
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

            <label class="form-label">
              Password
            </label>

            <input
              id="signup-password"
              type="password"
              class="form-input"
              placeholder="Create password"
              minlength="6"
              required
            />

          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
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
            .querySelector("#signup-name")
            .value
            .trim();

        const username =
          modal
            .querySelector("#signup-username")
            .value
            .trim();

        if (!name || !username) {

          showToast(
            "Complete all fields",
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
            .map(word => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();

        state.isLoggedIn = true;

        saveState();

        closeModal(modal);

        updateAuthUI();

        showToast(
          "Account created 🎉"
        );
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
        <div style="text-align:center;">

          <div
            class="profile-avatar"
            style="
              margin:0 auto 15px;
            "
          >
            ${escapeHTML(user.avatar)}
          </div>

          <h2>
            ${escapeHTML(user.name)}
          </h2>

          <p
            class="text-muted"
            style="margin-top:5px;"
          >
            ${escapeHTML(user.username)}
          </p>

          <p
            style="
              color:#ccc;
              margin:18px 0;
              line-height:1.6;
            "
          >
            ${escapeHTML(user.bio)}
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
   LOGOUT
   ========================================================= */

function logout() {

  state.isLoggedIn = false;

  saveState();

  updateAuthUI();

  showToast(
    "You have been logged out"
  );
}


/* =========================================================
   AUTH UI
   ========================================================= */

function updateAuthUI() {

  const login =
    $("[data-action='login']");

  const signup =
    $("[data-action='signup']");

  if (state.isLoggedIn) {

    if (login) {
      login.textContent = "Profile";
      login.dataset.action = "profile";
    }

    if (signup) {
      signup.textContent = "Create Post";
      signup.dataset.action = "create-post";
    }

  } else {

    if (login) {
      login.textContent = "Login";
      login.dataset.action = "login";
    }

    if (signup) {
      signup.textContent = "Join TalkLife";
      signup.dataset.action = "signup";
    }
  }
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
      "Creative AI comedy content."
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
      "Creative AI comedy concept."
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
    $(".ai-video-grid");

  if (!container) return;

  container.innerHTML =
    aiVideos
      .map(
        (video, index) => `
          <div
            class="ai-video-card"
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
                ${escapeHTML(video.title)}
              </h3>

              <p>
                ${escapeHTML(video.description)}
              </p>

            </div>

          </div>
        `
      )
      .join("");

  container.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-action='ai-video']"
        );

      if (!button) return;

      const index =
        Number(button.dataset.index);

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
                #292929
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
              ${escapeHTML(video.title)}
            </h3>

            <p
              style="
                color:#999;
                margin-top:10px;
                line-height:1.6;
              "
            >
              ${escapeHTML(video.description)}
            </p>

          </div>

        </div>
      `
    );

  document.body.appendChild(modal);
}


/* =========================================================
   TRENDING
   ========================================================= */

function renderTrending() {

  const container =
    $(".trending-list");

  if (!container) return;

  const trends = [
    ["#TalkLife", "12.4K posts"],
    ["#FunnyVideos", "8.7K posts"],
    ["#AI", "6.2K posts"],
    ["#Nigeria", "5.8K posts"],
    ["#Technology", "4.1K posts"]
  ];

  container.innerHTML =
    trends
      .map(
        trend => `
          <div class="trend">

            <strong>
              ${escapeHTML(trend[0])}
            </strong>

            <span>
              ${escapeHTML(trend[1])}
            </span>

          </div>
        `
      )
      .join("");
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

  $$(".nav a, .mobile-nav-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        event => {

          const page =
            item.dataset.page;

          if (!page) return;

          event.preventDefault();

          state.currentPage =
            page;

          $$(".nav a, .mobile-nav-item")
            .forEach(element => {
              element.classList.remove(
                "active"
              );
            });

          item.classList.add("active");

          const section =
            document.querySelector(
              `[data-section="${page}"]`
            );

          if (section) {
            section.scrollIntoView({
              behavior: "smooth"
            });
          }
        }
      );
    });
}


/* =========================================================
   KEYBOARD
   ========================================================= */

function setupKeyboard() {

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
          $(".search-box input");

        if (search) {
          search.focus();
        }
      }

      if (event.key === "Escape") {

        const modal =
          $(".modal-overlay");

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

  setupNavigation();

  setupKeyboard();

  updateAuthUI();

  console.log(
    "TalkLife loaded successfully 🚀"
  );
}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeTalkLife
  );

} else {

  initializeTalkLife();

}
