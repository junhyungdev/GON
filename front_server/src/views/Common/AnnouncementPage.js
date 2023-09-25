import React from "react";
import AppShell from "./AppShell";
import AppShellAdmin from "..//Admin/AppShellAdmin";
import { useSelector } from "react-redux";
import AppShellTeacher from "../Teacher/AppShellTeacher";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
// css
import "../../assets/css/Announcement.css";
// reactstrap components

// core components
import AnnouncementList from "./AnnouncementList";

function AnnouncementPage() {
  const user = useSelector((state) => state.user);
  const goArticleCreate = (e) => {
    e.preventDefault();
    navigate("/ArticleCreate");
  };
  const navigate = useNavigate();
  return (
    <>
      {user.account === 1 ? (
        <AppShellTeacher />
      ) : user.account === 0 ? (
        <AppShellAdmin />
      ) : (
        <AppShell />
      )}
      <div
        style={{
          fontWeight: "bold",
          fontFamily: "Copperplate, sans-serif",
          fontSize: "19px",
          marginTop: "10px",
          marginBottom: "10px",
          marginLeft: "5px",
        }}
        id="subListTitle"
      >
        Announcement
      </div>
      <div>
        <AnnouncementList />
      </div>
      <div className="pagination-container">
        <div className="pagination-wrapper">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {user.account === 0 && (
              <Button color="info" onClick={goArticleCreate} id="deleteBtn">
                Create
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AnnouncementPage;
