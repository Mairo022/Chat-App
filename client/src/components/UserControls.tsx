import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IUserControlsProps } from "../types/chatTypes";
import { useView } from "../context/viewContext";
import { NavigateFunction } from "react-router/lib/hooks";
import "../styles/components/UserControls.sass";

function UserControls(props: IUserControlsProps): JSX.Element {
    const username = props.username
    const userID = props.userID
    const navigate: NavigateFunction = useNavigate()

    const [profileVisible, setProfileVisible] = useState<boolean>(false)

    const { isMobile, showMessages } = useView()
    const hideComponent: boolean = isMobile && showMessages

    function onLogOut(): void {
        localStorage.clear()
        navigate("/login", { replace: true })
    }

    function handleOutsideProfileClick(e: MouseEvent): void {
        const el = e.target as Element

        if (!el.className.includes("userControls-profile")) {
            setProfileVisible(false)
        }
    }

    useEffect(() => {
        if (profileVisible) {
            document.addEventListener('click', handleOutsideProfileClick, true)
        }

        return () => {
            document.removeEventListener('click', handleOutsideProfileClick)
        }
    }, [profileVisible])

    const profileJSX = (): JSX.Element =>
        profileVisible
            ? <div className="userControls-profile-window">
                <div className="userControls-profile-window-content">
                    <div className="userControls-profile-window-close"
                         onClick={ () => { setProfileVisible(visible => !visible) } }
                    >
                        Close
                    </div>
                    <div className="userControls-profile-window-username">
                        <p className="userControls-profile-window-username-label">Username</p>
                        <p className="userControls-profile-window-username-value">{ username }</p>
                    </div>
                    <div className="userControls-profile-window-userID">
                        <p className="userControls-profile-window-userID-label">User ID</p>
                        <p className="userControls-profile-window-userID-value">{ userID }</p>
                    </div>
                </div>
            </div>
            : <></>

    return (
        <div className="userControls" style={ { "display": hideComponent ? "none" : "flex" } }>
            { profileJSX() }
            <div className="userControls-profile" onClick={ () => { setProfileVisible(visible => !visible) } }>
                Profile
            </div>
            <div className="userControls-logout" onClick={ () => { onLogOut() } }>
                Log Out
            </div>
        </div>
    )
}

export default UserControls