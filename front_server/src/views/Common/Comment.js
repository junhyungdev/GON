import React, { useState } from "react";
import axios from "axios";
import { Grid, Paper } from "@material-ui/core";
import { Col, Row } from "react-bootstrap";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Favorite from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import ClearIcon from "@material-ui/icons/Clear";
import LocalHospitalIcon from "@material-ui/icons/LocalHospital";
import swal from "sweetalert";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import profileImg from "../../assets/img/profile_temp.png";
// [댓글] 컴포넌트
const Comment = ({
  commentObj,
  content,
  isOwner,
  onReadComment,
  commentCount,
  setCommentCount,
  posting_id,
  onDeleteComment,
}) => {
  const user = useSelector((state) => state.user);
  const url = "http://localhost:5000";
  const { idx } = useParams();
  const [likeCount, setLikeCount] = useState(commentObj.likepeoplelength);
  const [likeState, setLikeState] = useState(
    Boolean(commentObj.likepeople.find(liked))
  );
  const [loading, setLoading] = useState(false);

  // [댓글] 이전에 사용자 댓글 좋아요 클릭 여부 확인
  function liked(element) {
    if (element === user._id) {
      return true;
    } else {
      return false;
    }
  }

  // [댓글] 좋아요 버튼 핸들러
  function onLikeHandle(event) {
    setLikeState(event.target.checked);
    if (event.target.checked === true) {
      onClickLike();
    } else {
      onCancelLike();
    }
  }

  // [CLICK] 좋아요 클릭 핸들러
  const onClickLike = async () => {
    if (loading) return;
    setLoading(true);
    setLikeCount(likeCount + 1);
    await axios
      .post(`${process.env.REACT_APP_BASE_URL}/api/comment/like/click`, {
        body: JSON.stringify({
          comment_id: commentObj.comment_id,
          likeuser: user._id,
        }),
      })
      .then(() => {
        console.log("[CLICK] Comment Like");
        setLoading(false);
      })
      .catch(() => {
        alert("[CLICK] Comment Like Error");
        setLoading(false);
      });
  };

  // [CANCEL] 댓글 좋아요 취소 핸들러
  const onCancelLike = async () => {
    if (loading) return;
    setLoading(true);
    if (likeCount >= 0) {
      setLikeCount(likeCount - 1);
    }
    await axios
      .post(`${process.env.REACT_APP_BASE_URL}/api/comment/like/cancel`, {
        body: JSON.stringify({
          comment_id: commentObj.comment_id,
          likeuser: user._id,
        }),
      })
      .then(() => {
        console.log("[CANCEL] Comment Like");
        setLoading(false);
      })
      .catch(() => {
        alert("[CANCEL] Comment Like Error");
        setLoading(false);
      });
  };

  return (
    <>
      <Paper
        elevation={0}
        style={{ width: "100%", marginTop: 5, marginBottom: 5 }}
      >
        <Grid item xs={12}>
          <Row>
            <Col item xs={3} style={{ fontWeight: "bold" }}>
              {/* [댓글] 작성자 프로필 사진 */}
              <img
                id="commentProfileImg"
                src={profileImg}
                width="30vw"
                height="30vh"
                style={{ margin: 15, borderRadius: "20px" }}
              />
              {/* [댓글] 작성자 닉네임 */}
              {commentObj.full_name}
              {/* 게시글 작성자가 의사일 경우 토닥터 뱃지 표기 */}
              {commentObj.usertype && (
                <LocalHospitalIcon style={{ marginLeft: 5, color: "green" }} />
              )}
            </Col>
            <Col item xs={5} style={{ margin: 0, paddingTop: 20 }}>
              {/* [댓글] 내용 */}
              {content}
            </Col>
            <Col item xs={1} style={{ margin: 0, paddingTop: 20 }}>
              {/* [댓글] 작성 날짜 */}
              {/* {commentObj.date} */}
            </Col>
            <Col item xs={2} style={{ display: "flex", alignItems: "center" }}>
              {/* [댓글] 좋아요 버튼 */}
              <FormControlLabel
                style={{ margin: 0, paddingTop: 0 }}
                control={
                  <Checkbox
                    icon={<FavoriteBorder />}
                    checkedIcon={<Favorite />}
                    onChange={onLikeHandle}
                    checked={likeState}
                    name="likeState"
                  />
                }
              />
              <span>{likeCount}</span>

              {/* [댓글] 작성자일 경우 삭제 버튼 표기 */}
              {isOwner || user.account === 0 ? (
                <ClearIcon
                  onClick={onDeleteComment}
                  style={{ marginLeft: "10px", color: "lightgray" }}
                />
              ) : (
                <Col item xs={1}></Col>
              )}
            </Col>
          </Row>
        </Grid>
      </Paper>
    </>
  );
};

export default Comment;
