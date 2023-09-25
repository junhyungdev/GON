import { json, useLocation } from "react-router-dom";
import { useTable, usePagination } from "react-table";

import axios from "axios"; // Axios 사용 예시
import { FormGroup, Label, Input, Button, UncontrolledAlert } from "reactstrap";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function AssignStudents() {
  const location = useLocation();
  const rowData = location.state
    ? location.state.rowData
    : console.log("rowData null");
  console.log("course info" + JSON.stringify(rowData));
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [pageSize, setPageSize] = useState(1000);
  const [regiStdInfo, setRegiStdInfo] = useState([]);
  const [unregiStdInfo, setUnregiStdInfo] = useState([]);
  const [selectedRow, setSelectedRow] = useState();
  const [selectedSecondRow, setSelectedSecondRow] = useState();
  const [errpopupVisible, setErrPopupVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [delStdpopupVisible, setDelStdpopupVisible] = useState(false);
  const [errorDelStdpopupVisible, setErrorDelStdpopupVisible] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [loading, setLoading] = useState(false);
  const handleRowClick = (rowIndex) => {
    setSelectedRow(rowIndex);
    console.log(selectedRow);
    setSelectedSecondRow(null);
    handleDeleteCheckbox(rowIndex);
  };
  const handleSecondSelectRow = (rowIndex) => {
    console.log(rowIndex);
    handleCheckboxChange(rowIndex);
    setSelectedSecondRow(rowIndex);
    setSelectedRow(null);
    console.log("selectedSecondRow" + selectedSecondRow);
  };
  const [selectedRowIndices, setSelectedRowIndices] = useState([]); //체크된 행 rowindex 배열
  const [deleteSelectIdx, setDeleteSelectIdx] = useState([]);
  const [registerNewStd, setRegisterNewStd] = useState([]);
  const [deleteStd, setDeleteStd] = useState([]);
  const handleCheckboxChange = (rowIndex) => {
    // 기존에 선택된 행인지 확인
    const selectedStudentId = unregiStdInfo[rowIndex]._id.$oid;
    setDeleteSelectIdx([]);
    setSelectedRowIndices((prevIndices) =>
      prevIndices.filter((index) => index !== rowIndex)
    );
    console.log("check row?" + rowIndex);
    if (registerNewStd.includes(selectedStudentId)) {
      // 이미 선택된 행이라면 배열에서 제거
      console.log("이미선택!" + registerNewStd);
      setRegisterNewStd((prevData) =>
        prevData.filter((studentId) => studentId !== selectedStudentId)
      );
    } else {
      setSelectedRowIndices((prevIndices) => [...prevIndices, rowIndex]);
      // 선택되지 않은 행이라면 배열에 추가
      setRegisterNewStd((prevData) => {
        const updatedData = [...prevData, selectedStudentId];
        console.log("추가", updatedData);
        return updatedData;
      });
    }
  };
  const handleDeleteCheckbox = (rowIndex) => {
    const selectedStudentId = regiStdInfo[rowIndex]._id.$oid;
    setSelectedRowIndices([]);
    setDeleteSelectIdx((prevIndices) =>
      prevIndices.filter((index) => index !== rowIndex)
    );
    console.log("check row?" + rowIndex);
    if (deleteStd.includes(selectedStudentId)) {
      // 이미 선택된 행이라면 배열에서 제거
      console.log("이미선택!" + deleteStd);
      setDeleteStd((prevData) =>
        prevData.filter((studentId) => studentId !== selectedStudentId)
      );
    } else {
      setDeleteSelectIdx((prevIndices) => [...prevIndices, rowIndex]);
      // 선택되지 않은 행이라면 배열에 추가
      setDeleteStd((prevData) => {
        const updatedData = [...prevData, selectedStudentId];
        console.log("추가", updatedData);
        return updatedData;
      });
    }
  };
  const firstTableColumns = [
    {
      accessor: "s_n",
      Header: "S.N.",
    },
    {
      accessor: "full_name",
      Header: "Name",
    },
    {
      accessor: "phone_num",
      Header: "phone_num",
    },
  ];
  const secondTableColumns = [
    {
      accessor: "s_n",
      Header: "S.N.",
    },
    {
      accessor: "full_name",
      Header: "Name",
    },
    {
      accessor: "phone_num",
      Header: "phone_num",
    },
  ];
  const columns = useMemo(() => firstTableColumns, []);
  const secondcolumns = useMemo(() => secondTableColumns, []);
  const fetchData = async () => {
    console.log("fetchData 호출");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/courses/${rowData._id}/students`
      );
      setRegiStdInfo(response.data.course_student);
      setUnregiStdInfo(response.data.not_course_student);
    } catch (error) {
      console.log("course regi Student get err:", error);
    }
  };
  useEffect(() => {
    // const fetchData = async () => {
    //   try {
    //     const response = await axios.get(
    //       `/api/courses/${rowData._id}/students`
    //     );
    //     setRegiStdInfo(response.data.course_student);
    //     setUnregiStdInfo(response.data.not_course_student);
    //   } catch (error) {
    //     console.log("course regi Student get err:", error);
    //   }
    // };

    fetchData();
  }, [registerNewStd, deleteStd]);

  const addHandler = async () => {
    if (loading) return;
    setLoading(true);
    const body = {
      course_id: rowData._id,
      students: registerNewStd.map((studentId) => ({ _id: studentId })),
    };
    console.log("request body==============\n" + JSON.stringify(body));
    await axios.post(`${BASE_URL}/api/assign/student`, body).then((res) => {
      if (res.data.code === "200") {
        // 성공적으로 추가된 경우
        setPopupVisible(true);
        setTimeout(() => {
          setPopupVisible(false);
        }, 3000);
        setSelectedRowIndices([]);
        fetchData();
        setRegisterNewStd([]);
        setLoading(false);
      } else {
        // 실패한 경우 처리
        setErrPopupVisible(true);
        setTimeout(() => {
          setErrPopupVisible(false);
        }, 3000);
        setLoading(false);
      }
    });
  };
  const deleteHandler = async () => {
    // const body = {
    //   student_id: deleteStd,
    // };
    const queryString = deleteStd.map((id) => `student-id=${id}`).join("&");
    const url = `${BASE_URL}/api/assign/student?course-id=${rowData._id}&${queryString}`;
    console.log("delete : ", url);
    await axios.delete(url).then((response) => {
      if (response.data.code === "200") {
        // 성공적으로 추가된 경우
        setDelStdpopupVisible(true);
        setTimeout(() => {
          setDelStdpopupVisible(false);
        }, 3000);
        setDeleteSelectIdx([]);
        fetchData();
        setDeleteStd([]);
      } else {
        // 실패한 경우 처리
        setErrorDelStdpopupVisible(true);
        setTimeout(() => {
          setErrorDelStdpopupVisible(false);
        }, 3000);
      }
    });

    console.log(url);
  };

  const data = useMemo(() => regiStdInfo, [regiStdInfo]);

  const getCurrentPageData = () => {
    if (data) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return data.slice(startIndex, endIndex);
    }
    return [];
  };

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

  const lowerTableData = useMemo(() => unregiStdInfo, [unregiStdInfo]);
  const getLowerCurrentPageData = () => {
    console.log(JSON.stringify(lowerTableData));
    if (lowerTableData) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return lowerTableData.slice(startIndex, endIndex);
    }
    return [];
  };
  // 현재 페이지에 해당하는 데이터를 가져옵니다.
  const secondCurrentPageData = useMemo(
    () => getLowerCurrentPageData(),
    [data, currentPage]
  );

  const {
    getTableProps: getSecondTableProps,
    getTableBodyProps: getSecondTableBodyProps,
    headerGroups: secondTableHeaderGroups,
    rows: secondTableRows,
    prepareRow: prepareSecondTableRow,
  } = useTable(
    {
      columns: secondcolumns,
      data: secondCurrentPageData, // 두 번째 테이블의 데이터
      initialState: { pageIndex: 0, pageSize }, // 초기 페이지 설정
    },
    usePagination // 페이지네이션 사용
  );
  const handleBackButtonClick = () => {
    navigate("/assignStdInCourse");
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
              Assign Student in Course
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className="popup-container">
        <UncontrolledAlert color="danger" isOpen={errpopupVisible}>
          <b>Failed!</b>
          <button className="close" onClick={() => setErrPopupVisible(false)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </UncontrolledAlert>
        <UncontrolledAlert color="info" isOpen={popupVisible}>
          <b>Success!</b> New student assigned successfully!
          <button className="close" onClick={() => setPopupVisible(false)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </UncontrolledAlert>
        <UncontrolledAlert color="danger" isOpen={errorDelStdpopupVisible}>
          <b>Failed!</b>
          <button
            className="close"
            onClick={() => setErrorDelStdpopupVisible(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </UncontrolledAlert>
        <UncontrolledAlert color="info" isOpen={delStdpopupVisible}>
          <b>Success!</b> Student disassigned successfully!
          <button
            className="close"
            onClick={() => setDelStdpopupVisible(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </UncontrolledAlert>
      </div>

      <div id="table">
        <h4 id="subListTitle">
          {" "}
          {rowData.batch} {rowData.grade}-{rowData.section}
        </h4>
        <div>
          <hr style={{ width: "100%", borderTop: "1px solid black" }} />
        </div>
        <div>
          <div id="table">
            <table {...getTableProps()} id="courseListTable">
              {" "}
              <thead>
                {headerGroups.map((header) => (
                  <tr {...header.getHeaderGroupProps()}>
                    <th>check</th>
                    {header.headers.map((col) => (
                      <th {...col.getHeaderProps()}>{col.render("Header")}</th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row, rowIndex) => {
                  prepareRow(row);
                  const isRowSelected = rowIndex === selectedRow;

                  const isRowChecked = deleteSelectIdx.includes(rowIndex);
                  return (
                    <tr
                      key={rowIndex}
                      id="rowFont"
                      {...row.getRowProps()}
                      style={{
                        background: isRowSelected ? "skyblue" : "none",
                      }}
                      onClick={() => handleRowClick(rowIndex)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isRowChecked}
                          onChange={() => handleDeleteCheckbox(rowIndex)}
                        />
                      </td>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} id="dataCell">
                          {cell.render("Cell")}
                        </td>
                      ))}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px", // 드롭다운 박스 사이의 간격
                            alignItems: "center", // 세로 중앙 정렬
                            // 기타 스타일 속성
                          }}
                        ></div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginRight: "20px",
              marginTop: "10px",
            }}
          >
            <Button
              disabled={!(selectedRow >= 0) | (selectedRow === null)}
              id="createBtn"
              onClick={deleteHandler}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
      <div id="table">
        <h4 id="subListTitle">Assign New Student</h4>
        <div>
          <hr style={{ width: "100%", borderTop: "1px solid black" }} />
        </div>
        <div>
          <div id="table">
            <table {...getSecondTableProps()}>
              {" "}
              <thead>
                {secondTableHeaderGroups.map((header) => (
                  <tr {...header.getHeaderGroupProps()}>
                    <th>check</th>
                    {header.headers.map((col) => (
                      <th {...col.getHeaderProps()}>{col.render("Header")}</th>
                    ))}
                    <th></th> {/* 추가: 체크박스 컬럼 */}
                  </tr>
                ))}
              </thead>
              <tbody {...getSecondTableBodyProps()}>
                {secondTableRows.map((row, rowIndex) => {
                  prepareSecondTableRow(row);
                  const isRowSelected = rowIndex === selectedSecondRow;
                  const isRowChecked = selectedRowIndices.includes(rowIndex);
                  return (
                    <tr
                      key={rowIndex}
                      id="rowFont"
                      {...row.getRowProps()}
                      style={{
                        background: isRowSelected ? "skyblue" : "none",
                      }}
                      onClick={() => handleSecondSelectRow(rowIndex)}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={isRowChecked}
                          onChange={() => handleCheckboxChange(rowIndex)}
                        />
                      </td>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} id="dataCell">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginRight: "20px",
            marginTop: "10px",
          }}
        >
          <Button
            disabled={!(selectedSecondRow >= 0) | (selectedSecondRow === null)}
            id="createBtn"
            onClick={addHandler}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
export default AssignStudents;
