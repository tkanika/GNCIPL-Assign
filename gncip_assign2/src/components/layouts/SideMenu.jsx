import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/UserContext";
import CharAvatar from '../cards/CharAvatar';

const SideMenu = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center gap-3 mt-3 mb-7">
        {/* Profile image wrapper */}
        <div className="w-20 h-20">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-20 h-20 bg-slate-400 rounded-full object-cover"
            />
          ) : (
            <CharAvatar
              fullName={user?.fullName || user?.name}
              width="w-20"
              height="h-20"
              style="text-xl"
            />
          )}
        </div>

        <h5 className="text-gray-950 font-medium leading-6">
          {user?.fullName || user?.name || ""}
        </h5>
      </div>

      {/* Side menu buttons */}
      {SIDE_MENU_DATA.map((item, index) => (
        <button
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] ${
            currentPath === item.path ? "text-white bg-primary" : "text-gray-700"
          } py-3 px-6 rounded-lg mb-3`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default SideMenu;