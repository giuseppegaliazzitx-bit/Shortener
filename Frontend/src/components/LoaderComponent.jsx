// src/components/LoaderComponent.jsx
import { ClipLoader } from "react-spinners";

function Loader({ size = 40, color = "#3b82f6" }) {
  return (
    <div className="flex items-center justify-center">
      <ClipLoader size={size} color={color} />
    </div>
  );
}

export default Loader;
