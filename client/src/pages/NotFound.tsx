import { NavLink } from "react-router-dom";
import "../styles/pages/NotFound.sass";

function NotFound(): JSX.Element {
    return (
        <div className="NotFound">
            <div className="NotFound-text">This page does not exist, yet</div>
            <NavLink to="/login" >
                <button className="NotFound-button" type="button">Main Page</button>
            </NavLink>
        </div>
    )
}

export default NotFound