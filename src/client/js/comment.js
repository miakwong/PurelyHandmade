/**
 * Comment management for Purely Handmade
 * This file handles the loading, rendering, and management of comments.
 */

// Initialize comment array from localStorage
let commentArr = [];

(() => {
  const commentsString = localStorage.getItem("commentArr");
  if (commentsString !== null) {
    commentArr = JSON.parse(commentsString).map(comment => ({
      ...comment,
      lastUpdated: new Date(comment.lastUpdated),
      upvotes: parseInt(comment.upvotes),
      downvotes: parseInt(comment.downvotes),
      childrenIds: JSON.parse(comment.childrenIds)
    }));
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  if (commentArr.length) renderComments();

  document.getElementById("add-comment").addEventListener("click", handleAddComment);
  document.getElementById("commentsList").addEventListener("click", handleCommentActions);
});

/**
 * Handle adding a new comment
 */
function handleAddComment() {
  const name = document.getElementById("name").value.trim();
  const handle = document.getElementById("handle").value.trim();
  const content = document.getElementById("comment").value.trim();

  if (!name || !handle || !content) {
    alert("All fields are required!");
    return;
  }

  addComment(name, handle, content, null);
  resetForm();
}

/**
 * Handle various comment actions like reply and delete
 * @param {Event} event - The event object
 */
function handleCommentActions(event) {
  const target = event.target;
  const [type, id] = target.id.split("-");

  switch (type) {
    case "reply":
      showReplyInput(id);
      break;
    case "addreply":
      handleAddReply(id);
      break;
    case "delete":
      if (confirm("Are you sure you want to delete this comment?")) {
        deleteComment(id);
      }
      break;
  }
}

/**
 * Handle adding a reply to a comment
 * @param {string} parentId - The ID of the parent comment
 */
function handleAddReply(parentId) {
  const replyContent = document.getElementById(`content-${parentId}`).value.trim();
  const replyName = document.getElementById(`name-${parentId}`).value.trim();
  const replyHandle = document.getElementById(`handle-${parentId}`).value.trim();

  if (!replyName || !replyHandle || !replyContent) {
    alert("All fields are required!");
    return;
  }

  addComment(replyName, replyHandle, replyContent, parentId);
}

/**
 * Show reply input fields for a comment
 * @param {string} parentId - The ID of the parent comment
 */
function showReplyInput(parentId) {
  const inputElem = `
    <li id="input-${parentId}">
      <div class="comment-input-row">
        <input type="text" placeholder="Name" id="name-${parentId}" class="name-handle" />
        <input type="text" placeholder="Handle" id="handle-${parentId}" class="name-handle" />
      </div>
      <textarea rows="3" id="content-${parentId}" class="comment-box" placeholder="Your reply..."></textarea>
      <button id="addreply-${parentId}" class="add-btn">Submit</button>
    </li>
  `;

  const parentElem = document.getElementById(`comment-${parentId}`);
  const childListElem = document.getElementById(`childlist-${parentId}`);

  if (!childListElem) {
    parentElem.innerHTML += `<ul id="childlist-${parentId}">${inputElem}</ul>`;
  } else {
    childListElem.innerHTML = inputElem + childListElem.innerHTML;
  }
}

/**
 * Store comments in localStorage
 */
function storeComments() {
  localStorage.setItem("commentArr", JSON.stringify(commentArr));
}

/**
 * Render all comments
 */
function renderComments() {
  const rootComments = commentArr.filter(comment => comment.parentId === null);
  document.getElementById("commentsList").innerHTML = rootComments.map(renderComment).join("");
}

/**
 * Render a single comment
 * @param {Object} comment - The comment object
 * @returns {string} - The HTML string for the comment
 */
function renderComment(comment) {
  const id = comment.id;
  const childComments = comment.childrenIds.map(childId => renderComment(commentArr[childId])).join("");

  return `
    <div class="hr"><hr/></div>
    <li id="comment-${id}" class="comment">
      <div class="comment-header">
        <div class="comment-handle">${comment.handle}</div>
        <div class="comment-time">posted ${timeAgo(comment.lastUpdated)}</div>
      </div>
      <p class="comment-text">${comment.content}</p>
      <div class="comment-actions">
        <button id="reply-${id}" class="reply-btn">Reply</button>
        <button id="delete-${id}" class="delete-btn">Delete</button>
      </div>
      <ul id="childlist-${id}">${childComments}</ul>
    </li>
  `;
}

/**
 * Add a new comment to comment array
 * @param {string} name - The name of the commenter
 * @param {string} handle - The handle of the commenter
 * @param {string} content - The content of the comment
 * @param {string|null} parentId - The ID of the parent comment
 */
function addComment(name, handle, content, parentId) {
  const newComment = {
    id: commentArr.length,
    name,
    handle,
    content,
    lastUpdated: new Date(),
    upvotes: 0,
    downvotes: 0,
    childrenIds: [],
    parentId
  };

  commentArr.push(newComment);

  if (parentId !== null) {
    const parentComment = commentArr.find(comment => comment.id == parentId);
    if (parentComment) {
      parentComment.childrenIds.push(newComment.id);
    }
  }

  storeComments();
  renderComments();
}

/**
 * Delete a comment by ID
 * @param {string} id - The ID of the comment to delete
 */
function deleteComment(id) {
  const index = commentArr.findIndex(comment => comment.id == id);
  if (index !== -1) {
    commentArr.splice(index, 1);
    storeComments();
    renderComments();
  }
}

/**
 * Calculate time ago for a given date
 * @param {Date} date - The date to calculate time ago
 * @returns {string} - The formatted time ago string
 */
function timeAgo(date) {
  const diff = (new Date() - date) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

/**
 * Reset the comment form fields
 */
function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("handle").value = "";
  document.getElementById("comment").value = "";
}