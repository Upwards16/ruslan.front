import React from "react";
import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="text-[36px] text-blue-500 flex flex-col justify-center items-center w-full h-full">
      <img
        className="object-contain"
        src="https://cdni.iconscout.com/illustration/premium/thumb/task-list-2952322-2451624.png"
        alt="img"
      />
      <h1>404 PAGE</h1>
      <Link to="/home">
        <button
          type="button"
          className="text-[18px] outline-none bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
        >
          Go home
        </button>
      </Link>
    </div>
  );
}

