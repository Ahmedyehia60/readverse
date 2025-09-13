import { NavLink } from "react-router-dom";

const Umrah = () => {
  return (
    <div>
      <ul>
        <li>
          <NavLink to="/umrah/beforeUmrah">Before umrah</NavLink>
        </li>
        <li>
          <NavLink to="/umrah/tawaf">Tawaf scene</NavLink>
        </li>
        <li>
          <NavLink to="/umrah/saai">saai scene</NavLink>
        </li>
        <p>forbidden</p>
      </ul>
    </div>
  );
};

export default Umrah;
//this page will display boxes includes options like the simultion or fobiddens in umrah
