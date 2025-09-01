import React from 'react'
import { getInitials } from '../../utils/helper';

const CharAvatar = ({ fullName, width, height, style }) => {
  return (
    <div className={`${width || 'w-12'} ${height || 'h-12'} ${style || ''} flex items-center justify-center rounded-full text-white font-medium bg-gradient-to-r from-blue-500 to-purple-600`}>
      {getInitials(fullName || "")}
    </div>
  );
};

export default CharAvatar;