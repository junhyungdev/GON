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
import "../../../assets/css/DeleteTable.css";
// import Radio from "../../components/Radio";
// import RadioGroup from "../../components/RadioGroup";
import { Link } from "react-router-dom";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

function StudentInfo() {
  const navigate = useNavigate();
  const handleBackButtonClick = () => {
    navigate("/StudentManagement");
  };
  const [value, setValue] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const fullNameHeaderClass = "fullNameHeader";
  const BASE_URL = process.env.REACT_APP_BASE_URL;

  // 체크박스가 체크되었는지 여부를 관리하는 상태
  const [checkedRows, setCheckedRows] = useState([]);

  //radio를 클릭하면 인덱스 받아오기
  const handleRadioChange = (rowIndex) => {
    setSelectedRow(rowIndex);
  };

  //accessor와 받아오는 data keyname이 같아야함
  const columnData = [
    {
      accessor: "s_n",
      Header: "S.N.",
    },
    {
      accessor: "full_name",
      Header: "Full Name",
      headerClassName: fullNameHeaderClass,
    },
    {
      accessor: "id",
      Header: "ID",
    },

    {
      accessor: "phone_num",
      Header: "Phone No",
    },
    {
      accessor: "father_phone_num",
      Header: "Father No",
    },
    {
      accessor: "mother_phone_num",
      Header: "Mother No",
    },
    {
      accessor: "guardians_phone_num",
      Header: "Guardians No",
    },
  ];
  const columns = useMemo(() => columnData, []);

  const [studentInfo, setstudentInfo] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [pageSize, setPageSize] = useState(6); //한페이지에 보여줄 페이지개수
  useEffect(() => {
    axios
      .get(
        `${BASE_URL}/api/students/`
        // "https://4ece099f-93aa-44bb-a61a-5b0fa04f47ac.mock.pstmn.io/StudentList"
      )
      .then((res) => {
        if (Array.isArray(res.data)) {
          const students = res.data.filter(
            (student) => student.id !== "gonStudent"
          );
          setstudentInfo(students);
        } else {
          console.log("데이터가 배열이 아닙니다.");
        }
      });
  }, []);

  //studentInfo에 변경이 있을 때만 업데이트
  const data = useMemo(() => studentInfo, [studentInfo]);
  //student delete
  const handleEdit = async () => {
    // Check if the data array is not empty and the rowIndex is within the valid range

    console.log("rowIndex" + JSON.stringify(data[selectedRow]));
    const selectedRowData = data[selectedRow];
    navigate("/studentManagement/StudentInfo/StudentEdit", {
      state: { rowData: selectedRowData },
    });
    // if (data.length > 0 && selectedRow >= 0 && selectedRow < data.length) {
    // } else {
    //   console.log("Invalid rowIndex or data is empty.");
    // }
  };

  // 현재 페이지에 해당하는 데이터를 가져오는 함수
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  // 다음 페이지로 이동하는 함수
  const goToNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // 이전 페이지로 이동하는 함수
  const goToPrevPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  // 현재 페이지에 해당하는 데이터를 가져옵니다.
  const currentPageData = useMemo(
    () => getCurrentPageData(),
    [data, currentPage]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
  } = useTable(
    {
      columns,
      data: currentPageData,
      initialState: { pageIndex: 0, pageSize },
    },
    usePagination
  );
  const pageCount = Math.ceil(data.length / pageSize);

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
              Student Info
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div>
        <div id="table">
          <table id="Stdtable" {...getTableProps()}>
            {" "}
            <thead>
              {headerGroups.map((header) => (
                <tr {...header.getHeaderGroupProps()}>
                  {header.headers.map((col) => (
                    <th
                      {...col.getHeaderProps()}
                      className={
                        col.Header === "Full Name" ? fullNameHeaderClass : ""
                      }
                    >
                      {col.render("Header")}
                    </th>
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
                    onClick={() => handleRadioChange(rowIndex)}
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <div className="pagination-container">
            <div className="pagination-wrapper">
              <Button onClick={handleEdit} id="EditBtn">
                Edit
              </Button>
              <Pagination
                className="pagination justify-content-center"
                listClassName="justify-content-center"
                aria-label="Page navigation example"
              >
                <PaginationItem disabled={currentPage === 1}>
                  <PaginationLink previous href="#" onClick={goToPrevPage} />
                </PaginationItem>
                {Array.from({ length: pageCount }, (_, index) => (
                  <PaginationItem
                    key={index}
                    active={index + 1 === currentPage}
                  >
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(index + 1);
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem disabled={currentPage === pageCount}>
                  <PaginationLink next href="#" onClick={goToNextPage} />
                </PaginationItem>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentInfo;
