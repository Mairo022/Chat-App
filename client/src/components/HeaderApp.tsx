import { useLocation } from "react-router-dom";
import { Location } from "history";
import '../styles/components/HeaderApp.sass';

function HeaderApp(): JSX.Element {
    const location: Location = useLocation()

    return location.pathname.includes("/chat")
        ? <></>
        : <h1 className="Header_app">Chat App</h1>
}

export default HeaderApp