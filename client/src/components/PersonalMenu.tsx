import { NavigateFunction } from "react-router/lib/hooks";
import { useNavigate } from "react-router-dom";
import "../styles/components/PersonalMenu.sass"

function PersonalMenu(): JSX.Element {
    const navigate: NavigateFunction = useNavigate()

    function logout(): void {
        localStorage.clear()
        navigate("/login", { replace: true })
    }

    return (
        <div className="Personal_menu">
            <div className="profile">Profile</div>
            <div className="settings">Settings</div>
            <div className="logout" onClick={ () => { logout(); } }> Logout</div>
        </div>
    )
}

export default PersonalMenu