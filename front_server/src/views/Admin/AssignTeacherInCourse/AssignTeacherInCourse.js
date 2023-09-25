import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTable, usePagination } from "react-table";
import { Input, Button, UncontrolledAlert } from "reactstrap";

import axios from "axios"; // Axios 사용 예시

import { useNavigate } from "react-router-dom";
import "../../../assets/css/AssignTeacher.css";
import AppShellAdmin from "../AppShellAdmin";
function AssignTeacherInCourse() {
  const [formData, setFormData] = useState({
    teacher1_id: "",
    teacher2_id: "",
  });
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const [teachers, setTeachers] = useState([]);
  const outerDivRef = useRef(null);
  const handleTeacherChange = (event, row, isSecondTeacher) => {
    const { name, value } = event.target;

    console.log(
      "=============================\n",
      "teacherid?" + event.target.value
    );
    // console.log("teacher?" + teachers);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setCourseInfo((prevCourseInfo) => {
      const updatedCourseInfo = [...prevCourseInfo];
      const rowIndex = row.index;
      updatedCourseInfo[rowIndex] = {
        ...updatedCourseInfo[rowIndex],
        [isSecondTeacher ? "teacher2" : "teacher"]: value,
      };
      return updatedCourseInfo;
    });
  };

  const secondTableColumns = [
    {
      accessor: "grade",
      Header: "grade",
    },
    {
      accessor: "section",
      Header: "section",
    },
    {
      accessor: "batch",
      Header: "batch",
    },
    {
      accessor: "subject_name",
      Header: "subject",
    },
    {
      accessor: "teacher_name",
      Header: "Teacher1", // "Teacher1" 헤더를 추가
    },
    {
      Header: "Teacher2", // "Teacher2" 헤더를 추가
    },
  ];
  const firstTableColumns = [
    {
      accessor: "grade",
      Header: "grade",
    },
    {
      accessor: "section",
      Header: "section",
    },
    {
      accessor: "batch",
      Header: "batch",
    },
    {
      accessor: "subject_name",
      Header: "subject",
    },
    {
      accessor: "teachers", // 현재 "teacher" 컬럼
      Header: "teacher1",
    },
    {
      Header: "teacher2",
    },
  ];
  const renderTeacher1Options = () => {
    return teachers.map((teacher) => (
      <option key={teacher.full_name} value={teacher._id}>
        {teacher.full_name}
      </option>
    ));
  };

  const columns = useMemo(() => firstTableColumns, []);
  const secondcolumns = useMemo(() => secondTableColumns, []);
  const [courseInfo, setCourseInfo] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [pageSize, setPageSize] = useState(1000);
  const [registerCourseInfo, setRegisterCourseInfo] = useState([]);
  const [selectedRow, setSelectedRow] = useState();
  const [selectedSecondRow, setSelectedSecondRow] = useState();
  const [loading, setLoading] = useState(false);
  const handleRowClick = (rowIndex) => {
    setSelectedRow(rowIndex);
    console.log(selectedRow);
    setSelectedSecondRow(null);
  };
  const handleSecondSelectRow = (rowIndex) => {
    console.log(rowIndex);

    setSelectedSecondRow(rowIndex);
    setSelectedRow(null);
    console.log("selectedSecondRow" + selectedSecondRow);
  };
  const handleOuterDivClick = (event) => {
    if (outerDivRef.current && !outerDivRef.current.contains(event.target)) {
      // 최상위 div 외부를 클릭한 경우에만 선택 초기화
      // setSelectedRow();
      // setSelectedSecondRow();
      // setFormData({
      //   teacher1_id: "",
      //   teacher2_id: "",
      // });
    }
  };

  const sectionOptions = [];
  for (
    let i = "a", idx = 0;
    idx < 6;
    i = String.fromCharCode(i.charCodeAt(0) + 1), idx++
  ) {
    sectionOptions.push(i);
  }
  async function showNonAssignCourseList() {
    await axios
      .get(
        // "https://4ece099f-93aa-44bb-a61a-5b0fa04f47ac.mock.pstmn.io/AssignCourse"
        `${BASE_URL}/api/courses/not-assigned`
      )
      .then((courseRes) => {
        console.log("non assign response" + JSON.stringify(courseRes.data));
        if (Array.isArray(courseRes.data)) {
          setCourseInfo(courseRes.data);
          return courseRes.data;
        } else {
          console.log("데이터가 배열이 아닙니다.");
        }
      });
  }
  async function showAssignedCourseList() {
    await axios
      .get(`${BASE_URL}/api/courses/assigned`)
      .then((res) => {
        console.log("assigned res.data??" + JSON.stringify(res.data));
        if (Array.isArray(res.data)) {
          //map 사용시 새로운 배열 생성해서

          const resultObj = res.data.map((item) => item);
          setRegisterCourseInfo(resultObj);
          return resultObj;
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
  const [errorTeacherpopupVisible, setErrorTeacherpopupVisible] =
    useState(false);
  const handleCreate = async () => {
    if (loading) return;
    setLoading(true);
    if (formData.teacher1_id == formData.teacher2_id) {
      setErrorTeacherpopupVisible(true);
      setTimeout(() => {
        setErrorTeacherpopupVisible(false);
      }, 3000);
    } else {
      const teacherIdArr = [formData.teacher1_id, formData.teacher2_id];
      const transformedVal = teacherIdArr.map((val) => ({
        _id: val,
      }));

      const requestData = {
        teachers: transformedVal,
        course_id: courseInfo[selectedRow]._id,
      };
      // setFormData({
      //   teacher1_id: "",
      //   teacher2_id: "",
      // });
      setSelectedRow();
      // data["teachers"] = inputValue;
      // const selectedRowData = data[selectedRow]._id;
      // data["course_id"] = selectedRowData;
      try {
        console.log("request data:" + JSON.stringify(requestData));
        const response = await axios.post(
          `${BASE_URL}/api/assign/teacher`,
          requestData
        );
        console.log("create이후 서버 응답:");
        console.log(JSON.stringify(response.data));
        // 서버의 응답 데이터를 확인하거나 다른 작업을 수행하시면 됩니다.
        showNonAssignCourseList();
        showAssignedCourseList();
        if (response.data.code == "200") {
          console.log("??enter?");

          showNonAssignCourseList();
          showAssignedCourseList();

          setPopupVisible(true);
          setTimeout(() => {
            setPopupVisible(false);
          }, 3000);
          setLoading(false);
        } else if (response.data.code == "400") {
          setErrPopupVisible(true);
          setTimeout(() => {
            setErrPopupVisible(false);
          }, 3000);
          setFormData({
            teacher1_id: "",
            teacher2_id: "",
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Error sending new Subject data to server:", error);
        setLoading(false);
      }
    }
  };
  const handleDelete = async () => {
    if (loading) return;
    setLoading(true);
    console.log(
      "rowIndex" +
        selectedSecondRow +
        " ?" +
        JSON.stringify(registerCourseInfo[selectedSecondRow])
    );
    if (selectedSecondRow >= 0) {
      console.log("rowIndex" + registerCourseInfo[selectedSecondRow]);
      try {
        const url = `${BASE_URL}/api/assign/teacher/${registerCourseInfo[selectedSecondRow]._id}`;
        const res = await axios.delete(url);

        showAssignedCourseList();
        showNonAssignCourseList();
        setLoading(false);
      } catch (error) {
        console.error("delete 실패. 에러발생:" + error);
        setLoading(false);
      }
    } else {
      console.log("Invalid rowIndex or data is empty.");
      setLoading(false);
    }
    showAssignedCourseList();
    showNonAssignCourseList();
  };

  useEffect(() => {
    const handleDocumentClick = (event) => {
      handleOuterDivClick(event);
    };

    document.addEventListener("mousedown", handleDocumentClick);

    const fetchData = async () => {
      try {
        const [registerCourseRes, courseRes, teachersRes] = await Promise.all([
          axios.get(
            // "https://4ece099f-93aa-44bb-a61a-5b0fa04f47ac.mock.pstmn.io/AssignCourse"
            `${BASE_URL}/api/courses/assigned`
          ),
          axios.get(
            // "https://4ece099f-93aa-44bb-a61a-5b0fa04f47ac.mock.pstmn.io/CourseList"
            `${BASE_URL}/api/courses/not-assigned`
          ),
          axios.get(`${BASE_URL}/api/teachers/`),
        ]);

        if (Array.isArray(registerCourseRes.data)) {
          console.log("second table:" + JSON.stringify(registerCourseRes.data));
          setRegisterCourseInfo(registerCourseRes.data);
        } else {
          console.log("assigned 티쳐 완료 data:데이터가 배열이 아닙니다.");
          console.log(JSON.stringify(registerCourseRes.data));
        }

        if (Array.isArray(courseRes.data)) {
          console.log("first table?" + JSON.stringify(courseRes));
          setCourseInfo(courseRes.data);
        } else {
          console.log("first table?" + JSON.stringify(courseRes));
          console.log("데이터가 배열이 아닙니다.");
        }

        if (Array.isArray(teachersRes.data)) {
          const teachers = teachersRes.data;
          setTeachers(teachers);
          console.log("teacherinfo" + JSON.stringify(teachers));
        } else {
          console.log("teacherinfo" + JSON.stringify(teachers));
          console.log("데이터가 배열이 아닙니다.");
        }
        // await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      return () => {
        document.removeEventListener("mousedown", handleDocumentClick);
      };
    };

    fetchData();
  }, []);
  const data = useMemo(() => courseInfo, [courseInfo]);
  //data = useMemo(() => courseInfo, [courseInfo]);
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

  const lowerTableData = useMemo(
    () => registerCourseInfo,
    [registerCourseInfo]
  );
  const getLowerCurrentPageData = () => {
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
  return (
    <div>
      <AppShellAdmin />
      {/* <div style={{ fontWeight: "bold", fontSize: "30px" }}>
        Assign Teacher in Course
      </div> */}
      <div className="popup-container">
        <UncontrolledAlert color="danger" isOpen={errpopupVisible}>
          <b>Failed!</b> This course has already been assigned. X
        </UncontrolledAlert>
        <UncontrolledAlert color="info" isOpen={popupVisible}>
          <b>Success!</b> Teacher assigned in course successfully! X
        </UncontrolledAlert>
        <UncontrolledAlert color="danger" isOpen={errorTeacherpopupVisible}>
          <b>Failed!</b> Please check the teacher select box. X
        </UncontrolledAlert>
      </div>

      <div ref={outerDivRef}>
        <div
          style={{
            fontWeight: "bold",
            fontFamily: "Copperplate, sans-serif",
            fontSize: "19px",
            marginTop: "10px",
            color: "black",
          }}
          id="subListTitle"
        >
          &nbsp;Assign Teacher in course
        </div>
        <div>
          <hr style={{ width: "100%", borderTop: "1px solid black" }} />
        </div>
        <h4
          style={{
            fontWeight: "bold",
            color: "black",
            fontSize: "21px",
            marginBottom: "10px",
          }}
          id="subListTitle"
        >
          &nbsp;Assign teacher to the course!
        </h4>
        <div id="table" className="AssignTeacherTable">
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map((header) => (
                <tr {...header.getHeaderGroupProps()}>
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
                    {row.cells.map((cell, idx) => (
                      <td {...cell.getCellProps()} id="dataCell">
                        {idx === 4 ? ( // "teacher" 컬럼을 나타내는 인덱스가 4인 경우
                          <td>
                            <Input
                              type="select"
                              name="teacher1_id"
                              id={`inputTeacher-${row.index}`}
                              value={
                                isRowSelected ? row.original.teache1_id : ""
                              }
                              onChange={(event) =>
                                handleTeacherChange(event, row)
                              }
                            >
                              <option value="">-- Select Teacher --</option>
                              {renderTeacher1Options()}
                            </Input>
                          </td>
                        ) : idx === 5 ? (
                          <td>
                            <Input
                              type="select"
                              name="teacher2_id" // 두 번째 드롭다운 상자의 이름
                              id={`inputTeacher2-${row.index}`}
                              value={
                                isRowSelected ? row.original.teache2_id : "null"
                              }
                              onChange={(event) =>
                                handleTeacherChange(event, row, true)
                              } // 두 번째 드롭다운 상자에 대한 핸들러
                            >
                              <option value="">-- Select Teacher --</option>
                              {renderTeacher1Options()}
                            </Input>
                          </td>
                        ) : (
                          cell.render("Cell")
                        )}{" "}
                        {/* 그 외의 경우에는 셀 콘텐츠를 그대로 표시 */}
                      </td>
                      // <td {...cell.getCellProps()} id="dataCell">
                      //   {cell.render("Cell")}
                      // </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Button
        disabled={!(selectedRow >= 0) | (selectedRow === null)}
        color="info"
        onClick={handleCreate}
        id="createBtn"
      >
        Assign
      </Button>

      <div>
        <h4
          style={{
            fontWeight: "bold",
            color: "black",
            fontSize: "21px",
            marginBottom: "10px",
          }}
          id="subListTitle"
        >
          &nbsp; List of teacher-assigned courses
        </h4>
        {/* <div>
          <hr style={{ width: "100%", borderTop: "1px solid black" }} />
        </div> */}
        <div id="table" className="AssignTeacherTable">
          <table {...getSecondTableProps()}>
            {" "}
            <thead>
              {secondTableHeaderGroups.map((header) => (
                <tr {...header.getHeaderGroupProps()}>
                  {header.headers.map((col) => (
                    <th {...col.getHeaderProps()} id="headerCell">
                      {col.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getSecondTableBodyProps()}>
              {secondTableRows.map((row, rowIndex) => {
                prepareSecondTableRow(row);
                const isRowSelected = rowIndex === selectedSecondRow;
                return (
                  <tr
                    key={rowIndex}
                    id="rowFont"
                    {...row.getRowProps()}
                    style={{
                      background: isRowSelected ? "skyblue" : "none",
                      width: "500px",
                    }}
                    onClick={() => handleSecondSelectRow(rowIndex)}
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} id="dataCell">
                        {cell.column.Header === "Teacher1"
                          ? // "Teacher1" 헤더의 경우 teacher_name을 출력
                            row.original.teacher_name[0]
                          : cell.column.Header === "Teacher2"
                          ? // "Teacher2" 헤더의 경우 teacher2_name을 출력
                            row.original.teacher_name[1]
                          : cell.render("Cell")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Button
        disabled={!(selectedSecondRow >= 0) | (selectedSecondRow === null)}
        color="info"
        onClick={handleDelete}
        id="AssignDeleteBtn"
      >
        Delete
      </Button>
    </div>
  );
}
export default AssignTeacherInCourse;
