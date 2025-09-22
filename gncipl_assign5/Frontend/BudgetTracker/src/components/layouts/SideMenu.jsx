import React, { useContext, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiEdit2 } from "react-icons/fi";

import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/UserContext";
import CharAvatar from '../Cards/CharAvatar';
import axiosInstance from '../../utils/axiosInstance';
import UploadImage from '../../utils/uploadImage';
import { API_PATHS } from '../../utils/apiPaths';

const SideMenu = () => {
  const { user, clearUser, updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const updateUserProfileImage = async (imageUrl) => {
    return axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE_IMAGE, { profileImageUrl: imageUrl });
  };

  const onProfileClick = () => {
    if (!uploading) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const data = await UploadImage(file);

      if (!data?.imageUrl) {
        throw new Error("No imageUrl found in upload response");
      }

      await updateUserProfileImage(data.imageUrl);

      updateUser(prev => ({ ...prev, profileImageUrl: data.imageUrl }));

      alert("Profile image updated successfully!");
    } catch (error) {
      console.error("Failed to upload/update image:", error);
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

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
        <div className="relative w-20 h-20">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-20 h-20 bg-slate-400 rounded-full object-cover"
            />
          ) : (
            <CharAvatar
              fullName={user?.fullName}
              width="w-20"
              height="h-20"
              style="text-xl"
            />
          )}

          {/* Edit icon positioned absolutely inside relative container */}
          <div
            onClick={onProfileClick}
            className={`absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md cursor-pointer ${
              uploading ? "opacity-50 pointer-events-none" : ""
            }`}
            title="Update profile picture"
          >
            <FiEdit2 className="text-gray-700 text-sm" />
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={onFileChange}
          style={{ display: "none" }}
        />

        <h5 className="text-gray-950 font-medium leading-6">
          {user?.fullName || ""}
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