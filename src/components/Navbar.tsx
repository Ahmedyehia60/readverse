// here added the navlinks with any design just to test the functionality
import { NavLink } from "react-router-dom";
const Navbar = () => {
  return (
    <nav className="max-w-lg mx-auto mt-7 mb-20 ">
      <ul className="flex items-center justify-between">
        <li className="hover:text-[#149eca] duration-200">
          <NavLink className="px-3 py-2" to="/">
            logo
          </NavLink>
        </li>
        <li className="hover:text-[#149eca] duration-200">
          <NavLink className="px-3 py-2" to="/umrah">
            umrah
          </NavLink>
        </li>
        <li className="hover:text-[#149eca] duration-200">
          <NavLink className="px-3 py-2" to="/haj">
            haj
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
