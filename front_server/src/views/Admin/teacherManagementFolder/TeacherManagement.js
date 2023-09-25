import AppShellAdmin from "../AppShellAdmin";

import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import { Link } from "react-router-dom";
import ListItemIcon from "@mui/material/ListItemIcon";
import EditIcon from "@material-ui/icons/Edit";
import * as React from "react";
import "../../../assets/css/MenuBar.css";
export default function TeacherManagement() {
  return (
    <div>
      <AppShellAdmin />
      <div
        style={{
          fontWeight: "bold",
          fontFamily: "Copperplate, sans-serif",
          fontSize: "21px",
          marginTop: "10px",
          color: "black",
        }}
      >
        &nbsp;Teacher Management
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="management-menu-bar">
          <div className="management-menu-items">
            <Link
              style={{
                fontFamily: "Copperplate, sans-serif",
              }}
              to={`/teacherManagement/register`}
            >
              <ListItemIcon>
                <AddIcon className="addicon" />
              </ListItemIcon>
              Add
            </Link>

            <Link
              style={{
                fontFamily: "Copperplate, sans-serif",
              }}
              to={`/teacherManagement/delete`}
            >
              {" "}
              <ListItemIcon>
                <DeleteIcon className="deleteicon" />
              </ListItemIcon>
              Delete
            </Link>
            <Link
              style={{
                fontFamily: "Copperplate, sans-serif",
              }}
              to={`/teacherManagement/TeacherInfo`}
            >
              {" "}
              <ListItemIcon>
                <EditIcon className="editicon" />
              </ListItemIcon>
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
