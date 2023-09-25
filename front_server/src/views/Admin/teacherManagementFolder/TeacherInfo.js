import React, { useEffect, useMemo, useState } from "react";
import { useTable, usePagination } from "react-table";

import axios from "axios"; // Axios 사용 예시
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { Button, UncontrolledAlert } from "reactstrap";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";
import "../../../assets/css/DeleteTable.css";
function TeacherInfo() {
  const navigate = useNavigate();
  const handleBackButtonClick = () => {
    navigate("/teacherManagement");
  };

  const [selectedRow, setSelectedRow] = useState(null);

  const fullNameHeaderClass = "fullNameHeader";

  //radio를 클릭하면 인덱스 받아오기
  const handleRadioChange = (rowIndex) => {
    setSelectedRow(rowIndex);
  };

  //accessor와 받아오는 data keyname이 같아야함
  const columnData = [
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
  ];
  const columns = useMemo(() => columnData, []);

  const [teacherInfo, setTeacherInfo] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [pageSize, setPageSize] = useState(6); //한페이지에 보여줄 페이지개수
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BASE_URL}/api/teachers/`).then((res) => {
      console.log("???" + res);
      if (Array.isArray(res.data)) {
        //map 사용시 새로운 배열 생성해서
        // const resultObj = res.data.map((item) => item);
        // setTeacherInfo(resultObj);
        const teachers = res.data.filter((teacher) => {
          const id = teacher.id;
          return (
            id !== "gonTeacher" && id !== "claschoolnp" && id !== "gonAdmin"
          );
        });
        setTeacherInfo(teachers);
        console.log("teacherinfo" + teachers);
      } else {
        console.log("데이터가 배열이 아닙니다.");
      }
    });
  }, []);

  //teacherInfo 변경이 있을 때만 업데이트
  const data = useMemo(() => teacherInfo, [teacherInfo]);
  //student delete
  const handleEdit = async () => {
    // Check if the data array is not empty and the rowIndex is within the valid range

    console.log("rowIndex" + JSON.stringify(data[selectedRow]));
    const selectedRowData = data[selectedRow];
    navigate("/teacherManagement/teacherinfo/teacherEdit", {
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
    state: { pageIndex },
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
              Edit Teacher Info
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div>
        <div id="table">
          <table {...getTableProps()}>
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
              <Button onClick={handleEdit} id="tchDeleteBtn">
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

export default TeacherInfo;
