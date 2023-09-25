import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import "../../assets/css/Home.css";
import { Button } from "reactstrap";

import AppShell from "./AppShell";
import AppShellAdmin from "../Admin/AppShellAdmin";
import AppShellTeacher from "../Teacher/AppShellTeacher";
import AnnouncementList from "./AnnouncementList.js";

const Announcement = () => {
  const url = "http://localhost:5000";
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BASE_URL}/api/announcements`)
      .then((res) => {
        setAnnouncements(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="announcement">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <ul>
            {announcements.map((announcement) => (
              <li key={announcement.id}>
                <Link to={`/announcements/${announcement.id}`}>
                  {announcement.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  const navigate = useNavigate();
  const goAncList = (e) => {
    e.preventDefault();
    navigate("/Announcement-Page");
  };
  const user = useSelector((state) => state.user);

  const goGoogleCalendar = () => {
    // 구글 캘린더 링크로 이동하는 URL
    const googleCalendarLink = "https://calendar.google.com";

    // 새 창에서 구글 캘린더 링크 열기
    window.open(googleCalendarLink, "_blank");
  };
  return (
    <div className="Home-container">
      {user.account === 1 ? (
        <AppShellTeacher />
      ) : user.account === 0 ? (
        <AppShellAdmin />
      ) : (
        <AppShell />
      )}

      <div id="myCalendar">
        <FullCalendar
          plugins={[dayGridPlugin, googleCalendarPlugin]}
          initialView="dayGridMonth"
          googleCalendarApiKey={apiKey}
          events={{
            googleCalendarId: "gofn2023@gmail.com",
          }}
          eventDisplay={"block"}
          eventTextColor={"#fff"}
          eventColor={"#0343CB"}
          height={"auto"}
          width={"100%"}
          // Toolbar
          headerToolbar={{
            left: "prev,next", // Display today, prev, and next buttons
            center: "title", // Display the title in the center of the header
            right: user.account === 0 ? "addButton" : "", // Display the custom "Add" button on the right side for account === 1
          }}
          customButtons={{
            // Define the custom "Add" button
            addButton: {
              text: "Add", // Button text
              // click: goGoogleCalendar,
            },
          }}
        />
      </div>

      <div id="simple_announce_div">
        <p
          style={{
            fontFamily: "Copperplate, sans-serif",
            fontSize: "20px",
          }}
          id="title"
        >
          Announcement
        </p>
        <Button size="sm" id="moreBtn" color="info" onClick={goAncList}>
          More
        </Button>
      </div>
      <div id="simple_announce">
        <AnnouncementList />
      </div>
    </div>
  );
};
export default Home;
