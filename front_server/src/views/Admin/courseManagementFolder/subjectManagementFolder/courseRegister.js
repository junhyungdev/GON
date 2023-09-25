import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input, Button, UncontrolledAlert } from "reactstrap";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Axios 사용 예시
export default function CourseRegister() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [errpopupVisible, setErrPopupVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    grade: "",
    section: "",
    batch: "",
    subject_idx: "",
  });
  function resetFormData() {
    setFormData({
      grade: "",
      section: "",
      batch: "",
      subject_idx: "",
    });
  }
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    console.log(formData);
  };
  const batchOptions = [];
  for (var i = 0; i < 10; i++) {
    batchOptions[i] = i + 2078;
  }
  const sectionOptions = [];
  for (
    let i = "a", idx = 0;
    idx < 6;
    i = String.fromCharCode(i.charCodeAt(0) + 1), idx++
  ) {
    sectionOptions.push(i);
  }

  const [subInfo, setSubInfo] = useState([]);
  const [subId, setSubId] = useState([]);
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/subjects/`)
      .then((res) => {
        console.log("courseInfo:" + JSON.stringify(res.data));
        if (Array.isArray(res.data)) {
          const subjectNames = res.data.map((subject) => subject.name);
          setSubInfo(subjectNames);
          const subIds = res.data.map((sub) => sub._id);
          setSubId(subIds);
          console.log("courseInfo:" + subInfo);
        } else {
          console.log("데이터가 배열이 아닙니다.");
        }
      })
      .catch((error) => {
        console.log("API 요청에 실패하였습니다.", error);
      });
  }, []);
  const handleBackButtonClick = () => {
    navigate("/courseManagement/subjectManagement");
  };
  const handleAdd = async () => {
    if (loading) return;
    setLoading(true);
    const data = {
      grade: formData.grade,
      section: formData.section,
      batch: formData.batch,
      subject_id: subId[formData.subject_idx],
    };

    await axios
      .post(`${BASE_URL}/api/courses/`, data)
      .then((response) => {
        console.log("서버 응답:");
        console.log(response.data);
        if (response.data.code === "200") {
          // 성공적으로 추가된 경우
          setPopupVisible(true);
          setTimeout(() => {
            setPopupVisible(false);
          }, 3000);
          resetFormData();
          setLoading(false);
        } else if (response.data.code === "400") {
          // 실패한 경우 처리
          setErrPopupVisible(true);
          setTimeout(() => {
            setErrPopupVisible(false);
          }, 3000);
          resetFormData();
          setLoading(false);
        } else {
          console.log("어케할까");
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error adding course:", error);
        setLoading(false);
      });
  };
  // const [batchOptions, setBatchOptions] = useState([]);

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
              Create Course
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className="popup-container">
        <UncontrolledAlert color="danger" isOpen={errpopupVisible}>
          <b>Failed!</b> Same course exists.
        </UncontrolledAlert>
        <UncontrolledAlert color="info" isOpen={popupVisible}>
          <b>Success!</b> New course created successfully!
        </UncontrolledAlert>
      </div>
      <form>
        <FormGroup className="col-md-4">
          <Label id="courseRegiInput" for="inputState">
            grade
          </Label>
          <Input
            type="select"
            name="grade"
            id="inputState"
            value={formData.grade} // 선택한 옵션의 값 formData에 할당
            onChange={handleInputChange}
          >
            <option value="">-- Select Grade --</option>

            <option value="PlayGroup">PlayGroup</option>
            <option value="Nursery">Nursery</option>
            <option value="LowerKG">LowerKG</option>
            <option value="UpperKG">UpperKG</option>
            <option value="Class1">Class1</option>
            <option value="Class2">Class2</option>
            <option value="Class3">Class3</option>
            <option value="Class4">Class4</option>
            <option value="Class5">Class5</option>
            <option value="Class6">Class6</option>
            <option value="Class7">Class7</option>
            <option value="Class8">Class8</option>
            <option value="Class9">Class9</option>
            <option value="Class10">Class10</option>
          </Input>
        </FormGroup>
        <FormGroup className="col-md-4">
          <Label for="inputState">Section</Label>
          <Input
            type="select"
            name="section"
            id="inputState"
            value={formData.section} // 선택한 옵션의 값 formData에 할당
            onChange={handleInputChange}
          >
            <option value="">-- Select Section --</option>

            {sectionOptions.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup className="col-md-4">
          <Label for="inputState">Batch</Label>
          <Input
            type="select"
            name="batch"
            id="inputState"
            value={formData.batch} // 선택한 옵션의 값 formData에 할당
            onChange={handleInputChange}
          >
            <option value="">-- Select Batch --</option>
            {batchOptions.map((option, index) => (
              <option key={index}>{option}</option>
            ))}
          </Input>
        </FormGroup>
        <FormGroup className="col-md-4">
          <Label for="inputState">Subject</Label>
          <Input
            type="select"
            name="subject_idx"
            id="inputState"
            value={formData.subject_idx} // 선택한 옵션의 값 formData에 할당
            onChange={handleInputChange}
          >
            <option value="">-- Select Subject --</option>
            {subInfo.map((option, index) => (
              <option key={index} value={index}>
                {option}
              </option>
            ))}
          </Input>
        </FormGroup>
      </form>
      <Button
        color="info"
        onClick={handleAdd}
        id="CourseRegideleteBtn"
        disabled={
          !formData.grade ||
          !formData.section ||
          !formData.batch ||
          formData.subject_idx === ""
        }
      >
        Add
      </Button>
    </div>
  );
}
