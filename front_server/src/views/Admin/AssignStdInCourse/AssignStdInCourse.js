import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTable, usePagination } from "react-table";
import { FormGroup, Label, Input, Button, UncontrolledAlert } from "reactstrap";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios"; // Axios 사용 예시
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/AssignTeacher.css";
import AppShellAdmin from "../AppShellAdmin";
function AssignStdInCourse() {
  const navigate = useNavigate();

  const outerDivRef = useRef(null);
  const BASE_URL = process.env.REACT_APP_BASE_URL;

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
      accessor: "teacher_name", // 현재 "teacher" 컬럼
      Header: "teacher1",
    },
    {
      Header: "teacher2",
    },
  ];

  const secondcolumns = useMemo(() => secondTableColumns, []);
  const [courseInfo, setCourseInfo] = useState([]);

  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [pageSize, setPageSize] = useState(1000);
  const [registerCourseInfo, setRegisterCourseInfo] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const handleSecondSelectRow = async (rowIndex) => {
    if (selectedRowIndex === rowIndex) {
      // 두 번 클릭되었을 때 페이지 이동
      goAssignStudentInCourse();
    } else {
      // 한 번 클릭되었을 때 배경색 변경
      setSelectedRowIndex(rowIndex);
    }
  };
  const goAssignStudentInCourse = async () => {
    if (selectedRowIndex !== null) {
      const selectedRowData = registerCourseInfo[selectedRowIndex];
      navigate("/assignStdInCourse/students", {
        state: { rowData: selectedRowData },
      });
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/courses/`);
        if (Array.isArray(response.data)) {
          setRegisterCourseInfo(response.data);
          console.log("eneter " + registerCourseInfo);
        } else {
          console.log("데이터가 배열이 아닙니다.");
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const data = useMemo(() => registerCourseInfo, [registerCourseInfo]);
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

      <div>
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
          &nbsp;Assigned Student in Course{" "}
        </div>

        <div>
          <hr style={{ width: "100%", borderTop: "1px solid black" }} />
        </div>
        <h4
          style={{
            marginBottom: "10px",
            color: "black",
          }}
          id="subListTitle"
        >
          &nbsp;Course List
        </h4>

        <div id="table">
          <table {...getSecondTableProps()}>
            {" "}
            <thead>
              {secondTableHeaderGroups.map((header) => (
                <tr {...header.getHeaderGroupProps()} id="headerRow">
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

                return (
                  <tr
                    key={rowIndex}
                    id="rowFont"
                    {...row.getRowProps()}
                    style={{
                      background:
                        selectedRowIndex === rowIndex ? "skyblue" : "none",
                    }}
                    onClick={() => handleSecondSelectRow(rowIndex)}
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} id="dataCell">
                        {cell.column.Header === "teacher1"
                          ? // "Teacher1" 헤더의 경우 teacher_name을 출력
                            row.original.teacher_name[0]
                          : cell.column.Header === "teacher2"
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

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginRight: "20px",
          }}
        ></div>
      </div>
    </div>
  );
}
export default AssignStdInCourse;
