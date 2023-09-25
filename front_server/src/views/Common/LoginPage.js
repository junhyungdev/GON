import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";

// css
import "../../assets/css/Login.css";
// reactstrap components
import { Button, Card, Form, Input, UncontrolledAlert } from "reactstrap";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { searchAction } from "../../store/userSlice";

function LoginPage() {
  const [iderrpopupVisible, setIDErrPopupVisible] = useState(false);
  const [pwerrpopupVisible, setPWErrPopupVisible] = useState(false);
  const [errpopupVisible, setErrPopupVisible] = useState(false);

  const BASE_URL = process.env.REACT_APP_BASE_URL;

  const url = "http://localhost:5000";
  const formRef = useRef();
  const [cookies, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const [loadingRequest, setLoadingRequest] = useState(false);
  const goHome = () => {
    navigate("/home");
  };
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  let user = useSelector((state) => {
    return state.user;
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (msg) {
      setTimeout(() => {
        setMsg("");
        setLoading(false);
      }, 1500);
    }
  }, [msg]);

  // const handleLogin = (e) => {
  //   e.preventDefault();
  //   const id = e.target.elements["id"].value;
  //   const password = e.target.elements["password"].value;
  // };
  const LoginFunc = (e) => {
    e.preventDefault();
    if (loadingRequest) {
      return;
    }
    setLoadingRequest(true);
    let body = {
      id,
      password,
    };

    axios.post(BASE_URL + "/api/login/", body).then((res) => {
      if (res.data.code == 200) {
        //console.log(res.data);
        //console.log("Login");
        goHome();
        setCookie("token", res.data.access_token); //cookie에 토큰저장
        dispatch(searchAction.loginUser(res.data));
        setLoadingRequest(false);
      } else if (res.data.code === 401) {
        setIDErrPopupVisible(true);
        setTimeout(() => {
          setIDErrPopupVisible(false);
        }, 3000);
        setLoadingRequest(false);
      } else if (res.data.code === 402) {
        setPWErrPopupVisible(true);
        setTimeout(() => {
          setPWErrPopupVisible(false);
        }, 3000);
        setLoadingRequest(false);
      } else {
        setErrPopupVisible(true);
        setTimeout(() => {
          setErrPopupVisible(false);
        }, 3000);
        setLoadingRequest(false);
        // alert("Account information is incorrect");
        // console.log(res.data);
        // setMsg("ID, Password is empty");
      }
    });
    setLoadingRequest(false);
    setLoading(true);
  };
  return (
    <>
      <div className="login-page">
        <div id="login-title-bar">
          <h3
            style={{
              fontFamily: "Copperplate, sans-serif",
              fontSize: "23px",
              fontWeight: "bold",
              color: "white",
            }}
            id="logintitle"
            className="title mx-auto"
          >
            Creative Learners'
            <br /> Academy
          </h3>
        </div>
        <div className="popup-container">
          <UncontrolledAlert color="danger" isOpen={iderrpopupVisible}>
            <b>Failed!</b> ID does not exists!
            <button
              className="close"
              onClick={() => setIDErrPopupVisible(false)}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </UncontrolledAlert>
          <UncontrolledAlert color="danger" isOpen={pwerrpopupVisible}>
            <b>Failed!</b> Password is not correct!
            <button
              className="close"
              onClick={() => setPWErrPopupVisible(false)}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </UncontrolledAlert>
          <UncontrolledAlert
            style={{
              marginTop: "28px",
            }}
            color="danger"
            isOpen={errpopupVisible}
          >
            <b>Failed!</b> There is no such account.
          </UncontrolledAlert>
        </div>
        <div id="bottom">
          <img
            id="logoid"
            className="centered-img"
            src={require("assets/img/logo.png")}
            alt="logo"
          />
        </div>
        <Form className="register-form">
          <label
            style={{
              fontFamily: "Copperplate, sans-serif",
              fontSize: "13px",
            }}
            id="login-text"
          >
            ID
          </label>
          <Input
            id="login_input"
            placeholder="ID"
            type="text"
            onChange={(e) => setId(e.target.value)}
          />
          <label
            style={{
              fontFamily: "Copperplate, sans-serif",
              fontSize: "13px",
            }}
            id="login-text"
          >
            Password
          </label>
          <Input
            id="login_input"
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            className="btn-round"
            disabled={!(password && id)}
            onClick={LoginFunc}
            id="login-btn"
          >
            Login
          </Button>
        </Form>

        <div className="footer register-footer text-center">
          <h6>
            © {new Date().getFullYear()}, made with{" "}
            <i className="fa fa-heart heart" /> by GON
          </h6>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
