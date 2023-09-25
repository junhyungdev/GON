import AppShellAdmin from "../AppShellAdmin";

import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import { Link } from "react-router-dom";
import * as React from "react";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";

export default function StudentManagement() {
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
        &nbsp;Student Management
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="management-menu-bar">
          <div className="management-menu-items">
            <Link
              to={`/studentManagement/register`}
              style={{
                fontFamily: "Copperplate, sans-serif",
              }}
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
              to={`/studentManagement/delete`}
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
              to={`/studentManagement/StudentInfo`}
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
