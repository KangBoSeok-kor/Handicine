import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import './Detail.css';
import axios from 'axios';

const BoardDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/board/${postId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        setPost(data);
        fetchComments();
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/board/${postId}/comments`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleBackToList = () => {
    navigate('/board');
  };

  const handleUpdateClick = () => {
    navigate(`/board/update/${postId}`);
  };

  const handleAddComment = async () => {
    const commentData = {
      content: newComment,
      postId: postId,
      authorUsername: userId,
    };
    try {
      const response = await axios.post(`http://localhost:8080/api/board/${postId}/comments`, commentData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleUpdateComment = async (commentId, updatedContent) => {
    try {
      const response = await axios.patch(`http://localhost:8080/api/board/${postId}/comments/${commentId}`, {
        content: updatedContent
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setComments(comments.map(comment =>
        comment.id === commentId ? response.data : comment
      ));
      setEditCommentId(null);
      setNewComment(""); // Clear newComment after editing
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/board/${postId}/comments/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditClick = (comment) => {
    setEditCommentId(comment.id);
    setNewComment(comment.content);
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div className="qna-page">
      <h1 className='page-title' style={{ color: "black", marginLeft: "300px" }}>게시물 내용</h1>
      <div className="detail-container">
        <h2>제목</h2>
        <div className="title-box">
          <h1 style={{ textAlign: "left" }}>{post.title}</h1>
        </div>
        <h2>내용</h2>
        <div className="content-box">
          <h4>{post.content}</h4>
        </div>
      </div>
      <h2 className="comment-section-title" style={{ color: "black", marginRight: "1000px" }}>댓글</h2>
      <Form.Control
        className='commentfield'
        as="textarea"
        rows={3}
        placeholder="댓글을 입력하세요"
        value={newComment}
        onChange={handleCommentChange}
        style={{ marginTop: "20px", width: "993px" }}
      />
      {comments.map((comment) => (
        <div key={comment.id} className='container-box' style={{ marginTop: "30px", maxWidth: "1000px" }}>
          <strong>{comment.authorUsername}</strong>: {editCommentId === comment.id ? (
            <Form.Control
              type="text"
              defaultValue={comment.content}
              onBlur={(e) => handleUpdateComment(comment.id, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateComment(comment.id, e.target.value); // Handle Enter key
                }
              }}
            />
          ) : (
            <span>{comment.content}</span>
          )}
          <div>
            {comment.authorUsername === userId && (
              <>
                <Button style={{ marginTop: "10px", marginLeft: "10px", backgroundColor: "skyblue" }} onClick={() => handleEditClick(comment)}>
                  수정
                </Button>
                <Button style={{ marginTop: "10px" }} onClick={() => handleDeleteComment(comment.id)}>삭제</Button>
              </>
            )}
          </div>
        </div>
      ))}
      <div className="write-button-container" style={{ marginTop: "20px" }}>
        {post.authorUsername === userId && (
          <Button variant="secondary" onClick={handleUpdateClick} style={{ marginRight: "10px" }}>
            수정하기
          </Button>
        )}
        <Button variant="secondary" onClick={handleBackToList} style={{ marginRight: "10px" }}>
          목록보기
        </Button>
        <Button variant="success" onClick={handleAddComment}>
          댓글등록
        </Button>
      </div>
    </div>
  );
};

export default BoardDetail;