import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import axios from "axios";
import { searchAction } from "../../store/userSlice";
import { useLocation, Outlet, Navigate } from "react-router-dom";

function LoginCheck() {
  const url = "http://localhost:5000";
  const dispatch = useDispatch();
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const token = cookies.token;
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const [renderComponent, setRenderComponent] = useState(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/auth/`,
            {
              headers: {
                Authorization: token,
              },
            }
          );
          console.log(response);
          if (response.data.code === "400") {
            dispatch(searchAction.clearUser(user));
            alert("Not authorized");
            console.log("Not authorized");
            setRenderComponent(
              <Navigate to="/login" state={{ from: location }} replace />
            );
          } else if (response.data.code === "200") {
            setRenderComponent(<Outlet />);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        dispatch(searchAction.clearUser(user));
        alert("Not authorized");
        console.log("Not have token");
        setRenderComponent(
          <Navigate to="/login" state={{ from: location }} replace />
        );
      }
    };

    checkAuthorization();
  }, []);

  return renderComponent;
}

export default LoginCheck;
