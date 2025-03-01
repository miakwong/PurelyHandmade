let commentArr = [];
(() => {
    let commentsString = localStorage.getItem("commentArr");
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

    let addCommentBtn = document.getElementById("add-comment");

    if (!addCommentBtn) {
        console.error("❌ Error: Cannot find 'Add Comment' button!");
        return;
    }

    addCommentBtn.addEventListener("click", () => {
        console.log("✅ Add Comment button clicked!");

        let name = document.getElementById("name") ? document.getElementById("name").value.trim() : "Anonymous";
        let handle = document.getElementById("handle") ? document.getElementById("handle").value.trim() : "@user";
        let content = document.getElementById("comment").value.trim();

        if (!content) {
            alert("Comment cannot be empty!");
            return;
        }

        addComment(name, handle, content, null);
        document.getElementById("comment").value = "";
    });

    document.getElementById("commentsList").addEventListener("click", event => {
        let target = event.target;
        let parts = target.id.split("-");
        let type = parts[0];
        let id = parts[1];

        if (type === "reply") {
            showReplyInput(id);
        } else if (type === "addreply") {
            let replyContent = document.getElementById(`content-${id}`).value.trim();
            let replyName = document.getElementById(`name-${id}`).value.trim();
            let replyHandle = document.getElementById(`handle-${id}`).value.trim();

            if (!replyName || !replyHandle || !replyContent) {
                alert("All fields are required!");
                return;
            }

            addComment(replyName, replyHandle, replyContent, id);
        } else if (type === "delete") {
            if (confirm("Are you sure you want to delete this comment?")) {
                deleteComment(id);
            }
        }
    });
});
