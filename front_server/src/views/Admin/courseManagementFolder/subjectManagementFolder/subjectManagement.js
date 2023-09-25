import React, { useEffect, useMemo, useState } from "react";
import { useTable, usePagination } from "react-table";
import { Button, UncontrolledAlert } from "reactstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios"; // Axios 사용 예시
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import "../../../../assets/css/SubList.css";
export default function SubjectManagement() {
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const handleBackButtonClick = () => {
    navigate("/courseManagement");
  };
  const handleNext = () => {
    navigate("/courseManagement/subjectManagement/courseRegister");
  };
  const [selectedRow, setSelectedRow] = useState(null);

  const columnData = [
    {
      accessor: "name",
      Header: "subject",
    },
  ];
  const columns = useMemo(() => columnData, []);
  const [subjectInfo, setSubjectInfo] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [pageSize, setPageSize] = useState(1000);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const handleRadioChange = (rowIndex) => {
    setSelectedRow(rowIndex);
    console.log(rowIndex);
  };
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  async function showSubList() {
    axios
      .get(BASE_URL + "/api/subjects/")
      .then((res) => {
        console.log("res.data??" + res.data);
        if (Array.isArray(res.data)) {
          //map 사용시 새로운 배열 생성해서
          console.log(JSON.stringify(res.data));
          const resultObj = res.data.map((item) => item);
          setSubjectInfo(resultObj);
        } else {
          console.log("SubManagement::데이터가 배열이 아닙니다.");
        }
      })
      .catch((Err) => {
        console.log(Err);
      });
  }
  const [isElective, setIsElective] = useState(false);
  const [errpopupVisible, setErrPopupVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [deleteErrPopupVisible, setDeleteErrPopupVisible] = useState(false);

  const handleElectiveButtonClick = (value) => {
    setIsElective(value);
    console.log(isElective + "?");
  };
  const handleCreate = async () => {
    if (loading) return; // 이미 요청 중이라면 추가 요청을 막습니다.

    setLoading(true);
    const data = {
      name: inputValue,
      is_elective_subject: isElective,
    };

    try {
      console.log(data);
      const response = await axios.post(BASE_URL + "/api/subjects/", data);
      console.log("서버 응답:");
      console.log(response.data);
      // 서버의 응답 데이터를 확인하거나 다른 작업을 수행하시면 됩니다.

      if (response.data.code == "200") {
        setPopupVisible(true);
        setTimeout(() => {
          setPopupVisible(false);
        }, 3000);
        showSubList();
        setInputValue("");
        setLoading(false);
      } else if (response.data.code == "400") {
        setErrPopupVisible(true);
        setTimeout(() => {
          setErrPopupVisible(false);
        }, 3000);
        setInputValue("");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error sending new Subject data to server:", error);
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (loading) return; // 이미 요청 중이라면 추가 요청을 막습니다.
    setLoading(true);
    console.log("rowIndex" + JSON.stringify(data[selectedRow]));
    if (selectedRow >= 0) {
      console.log("rowIndex" + data[selectedRow]._id);
      try {
        const url = `${BASE_URL}/api/subjects/${data[selectedRow]._id}`;
        const res = await axios.delete(url);
        showSubList();

        if (res.data.code == "200") {
          setDeletePopupVisible(true);
          setTimeout(() => {
            setDeletePopupVisible(false);
          }, 3000);
          setLoading(false);
        } else if (res.data.code == "420") {
          setDeleteErrPopupVisible(true);
          setTimeout(() => {
            setDeleteErrPopupVisible(false);
          }, 5000);
          setLoading(false);
        }
      } catch (error) {
        console.error("delete 실패. 에러발생:" + error);
        setLoading(false);
      }
    } else {
      console.log("Invalid rowIndex or data is empty.");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("?", selectedRow);
    axios
      .get(BASE_URL + "/api/subjects/")
      .then((res) => {
        console.log(res.data);
        if (Array.isArray(res.data)) {
          console.log("res.data??" + JSON.stringify(res.data));
          const resultObj = res.data.map((item) => item);
          setSubjectInfo(res.data);
        } else if (typeof res.data === "string") {
          // 객체를 배열로 변환
          const dataArray = Object.values(res.data);
          setSubjectInfo(dataArray);
        } else {
          console.log("데이터가 배열이 아닙니다.");
        }
      })
      .catch((Err) => {
        console.log(Err);
      });
  }, []);
  const data = useMemo(() => subjectInfo, [subjectInfo]);
  //data = useMemo(() => subjectInfo, [subjectInfo]);
  const getCurrentPageData = () => {
    if (data) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return data.slice(startIndex, endIndex);
    }
    return [];
  };

  // 현재 페이지에 해당하는 데이터를 가져옵니다.
  const currentPageData = useMemo(
    () => getCurrentPageData(),
    [data, currentPage]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: currentPageData,
        initialState: { pageIndex: 0, pageSize },
      },
      usePagination
    );
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
              &nbsp;Subject Management
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className="popup-container">
        <UncontrolledAlert color="danger" isOpen={errpopupVisible}>
          <b>Failed!</b> Same subject exists. X
        </UncontrolledAlert>
        <UncontrolledAlert color="info" isOpen={popupVisible}>
          <b>Success!</b> New subject created successfully! X
        </UncontrolledAlert>
        <UncontrolledAlert color="info" isOpen={deletePopupVisible}>
          <b>Success!</b> Subject deleted successfully! X
        </UncontrolledAlert>
        <UncontrolledAlert color="danger" isOpen={deleteErrPopupVisible}>
          <b>Failed!</b>
          <br /> First, delete the course to which the subject is assigned.
        </UncontrolledAlert>
      </div>
      <div id="table">
        <table {...getTableProps()}>
          {" "}
          <h4 id="newSubTitle">&nbsp;Subject List</h4>
          <div>
            <hr style={{ width: "100%", borderTop: "1px solid black" }} />
          </div>
          <div id="tbodyContainer">
            <tbody {...getTableBodyProps()} id="tbody">
              {rows.map((row, rowIndex) => {
                prepareRow(row);
                const isRowSelected = rowIndex === selectedRow;
                const subjectData = row.original;
                const displayName = subjectData.is_elective_subject
                  ? `* ${subjectData.name}`
                  : subjectData.name;
                return (
                  <tr
                    key={rowIndex}
                    id="rowFont"
                    {...row.getRowProps()}
                    style={{
                      background: isRowSelected ? "skyblue" : "none",
                    }}
                    onClick={() => handleRadioChange(rowIndex)}
                  >
                    <td>
                      <input
                        id="radioBtn"
                        type="radio"
                        checked={isRowSelected}
                        onClick={() => handleRadioChange(rowIndex)}
                      />
                      {/* <input
                        type="checkbox"
                        checked={isRowChecked}
                        onChange={() => handleCheckboxChange(rowIndex)}
                      /> */}
                    </td>

                    {row.cells.map((cell, cellIndex) => (
                      <td key={cellIndex} {...cell.getCellProps()}>
                        {cellIndex === 0 ? displayName : cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </div>
        </table>
      </div>
      <Button
        disabled={!(selectedRow >= 0) | (selectedRow === null)}
        color="info"
        onClick={handleDelete}
        id="AssignDeleteBtn"
      >
        Delete
      </Button>
      <h4 id="newSubTitle">&nbsp;Create a new subject</h4>
      <div>
        <hr style={{ width: "100%", borderTop: "1px solid black" }} />
      </div>
      <div id="SubSecondaryContainer">
        <div id="newSubDiv">
          <h4>subject name</h4>
          <input
            id="subjectInput"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Subject Name"
          />
        </div>

        <div id="isElectiveDiv">
          <h4>Is elective subject?</h4>
          <Button
            id="subElectiveBtn"
            value="true"
            className={isElective === true ? "btnSelect" : "btnDefault"}
            onClick={() => handleElectiveButtonClick(true)}
          >
            Y
          </Button>
          <Button
            id="subElectiveBtn"
            value="false"
            className={isElective === false ? "btnSelect" : "btnDefault"}
            onClick={() => handleElectiveButtonClick(false)}
          >
            N
          </Button>
        </div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginRight: "20px",
          }}
        >
          <Button
            disabled={inputValue === ""}
            color="info"
            onClick={handleCreate}
            id="subManageCreateBtn"
          >
            Create
          </Button>
          <Button color="info" onClick={handleNext} id="nextBtn">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
