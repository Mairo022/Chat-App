import { useLocation } from "react-router-dom";
import { Location } from "history";

function Header(): JSX.Element {
    const location: Location = useLocation()

    return location.pathname.includes("/chat")
        ? <></>
        : <h1 className="App-header">Chat App</h1>
}

export default Header