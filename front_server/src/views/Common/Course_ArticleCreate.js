import React, { useState, useEffect } from "react";
import Posting from "./Posting";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Grid, Paper } from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import SendIcon from "@mui/icons-material/Send";
import PhotoCameraIcon from "@material-ui/icons/PhotoCamera";
import { Row, Col } from "react-bootstrap";
import DeleteIcon from "@mui/icons-material/Delete";
import "../../assets/css/Community.css";
import { storageService } from "../../fBase";
import { v4 as uuidv4 } from "uuid";
import { ref, getDownloadURL, uploadString } from "firebase/storage";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// 글 작성
// [커뮤니티] 컴포넌트
const Course_ArticleCreate = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const url = "http://localhost:5000";
  const [title, setTitle] = useState(""); // 게시글(제목)
  const [posting, setPosting] = useState(""); // 게시글(내용)
  //const [newPosting, setNewPosting] = useState(""); // 새로운 게시글
  const [postings, setPostings] = useState([]); // 게시글 배열
  const [currentPage, setCurrentPage] = useState(0);
  const [attachment, setAttachment] = useState("");
  const { id } = useParams(); // /articles/:id와 동일한 변수명으로 데이터를 꺼낼 수 있습니다.
  const isDisabled = !title.trim();
  const [loadingRequest, setLoadingRequest] = useState(false);
  // 새 게시글 작성 후 글 올리기하면 호출
  useEffect(
    () => {},
    [
      /*newPosting*/
    ]
  );

  // [게시글 제목] 작성 핸들러
  const onTitleChange = (event) => {
    const {
      target: { value },
    } = event;
    setTitle(value);
  };

  // [게시글 내용] 작성 핸들러
  const onPostingChange = (event) => {
    const {
      target: { value },
    } = event;
    setPosting(value);
  };

  // [CREATE] 게시글 생성 핸들러
  const onCreatePosting = async (event) => {
    if (loadingRequest) {
      return;
    }
    event.preventDefault();
    setLoadingRequest(true);
    let attachmentUrl = "";

    if (attachment !== "") {
      const filePath = `${user._id}/${uuidv4()}`;
      const attachmentRef = ref(storageService, filePath);
      const uploadTaskSnapshot = await uploadString(
        attachmentRef,
        attachment,
        "data_url"
      );
      attachmentUrl = await getDownloadURL(uploadTaskSnapshot.ref);
    }

    await axios
      .post(
        `${process.env.REACT_APP_BASE_URL}/api/courses/` +
          id +
          "/articles/create",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: user._id,
            title: title,
            content: posting,
            full_name: user.full_name,
            attachmentUrl: attachmentUrl,
          }),
        }
      )
      .then(() => {
        console.log("[CREATE] 새 게시글 생성");
        navigate("/courses/" + id + "/articles");
        //setNewPosting(posting);
      })
      .catch(() => {
        console.log(url + "/api/courses/" + id + "/articles/create");
        alert("[CREATE] response (x)");
      });

    setPosting("");
    setLoadingRequest(false);
    //setAttachment("");
  };

  // [첨부파일] 업로드 핸들러
  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    console.log(files[0]);
    const reader = new FileReader();

    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };

  // [첨부파일] Clear 핸들러
  const onClearAttachment = () => setAttachment(null);

  const handleBackButtonClick = () => {
    navigate("/courses/" + id + "/articles");
  };

  return (
    <div>
      <div>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={handleBackButtonClick}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              style={{
                fontWeight: "bold",
                fontFamily: "Copperplate, sans-serif",
                fontSize: "17px",
              }}
              variant="h6"
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Article Create
            </Typography>
          </Toolbar>
        </AppBar>
      </div>

      <Paper
        elevation={0}
        style={{ width: "100%", border: "none", backgroundColor: "#f8f8f8" }}
      >
        <Grid container>
          <Grid item xs={12}>
            <Paper
              style={{
                border: "1px solid lightgray ",
                marginBottom: "15px",
                borderRadius: "1rem",
                padding: "16px",
              }}
            >
              {/* New Announcement Title */}
              <Grid
                container
                justify="space-between"
                alignItems="center"
                style={{ marginBottom: "16px" }}
              >
                {/* Title Text */}
                <p>New Announcement</p>

                {/* Send Button */}
                <IconButton
                  style={{ color: "#ff8a4e" }}
                  aria-label="create"
                  onClick={onCreatePosting}
                  disabled={isDisabled || loadingRequest}
                >
                  <SendIcon />
                </IconButton>
              </Grid>

              {/* Input Fields*/}

              <>
                <Grid item xs={12} style={{ marginBottom: "16px" }}>
                  <input
                    type="text"
                    value={title}
                    onChange={onTitleChange}
                    placeholder="Title"
                    maxLength={100}
                    style={{
                      padding: "16px",
                      width: "calc(100% - 32px)", // subtract padding,
                      border: "1px solid lightgrey",
                      overflowWrap: "break-word", // 줄바꿈 속성 추가
                    }}
                  ></input>
                </Grid>
              </>

              <>
                <Grid item xs={12} position="relative">
                  <textarea
                    cols="40"
                    rows="5"
                    type="text"
                    value={posting}
                    onChange={onPostingChange}
                    placeholder="Content"
                    maxLength={1000}
                    style={{
                      padding: "16px",
                      width: "calc(100% - 32px)", // subtract padding,
                      border: "1px solid lightgrey",
                    }}
                  ></textarea>

                  {/* 파일 첨부 */}
                  <div class="image-upload">
                    <label for="file-input">
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        display="none"
                        style={{ visibility: "hidden" }}
                      />
                      <PhotoCameraIcon color="disabled" />
                    </label>
                  </div>
                </Grid>
              </>

              {attachment && (
                <>
                  {/* Preview Image */}
                  <Grid item xs={12}>
                    <img src={attachment} width="100%" height="auto" />

                    {/* Delete Button */}
                    <IconButton
                      style={{
                        color: "gray",
                        top: "0",
                        right: "0",
                      }}
                      aria-label="delete"
                      onClick={onClearAttachment}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default Course_ArticleCreate;
