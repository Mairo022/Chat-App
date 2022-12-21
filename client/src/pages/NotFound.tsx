import { NavLink } from "react-router-dom";
import "../styles/pages/NotFound.sass";

function NotFound(): JSX.Element {
    return (
        <div className="Not_found">
            <div className="Not_found__text">This page does not exist</div>
            <NavLink to="/login" >
                <button className="Not_found__button" type="button">Main Page</button>
            </NavLink>
        </div>
    )
}

export default NotFound