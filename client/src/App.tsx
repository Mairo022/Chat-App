import { useEffect } from 'react';
import './App.sass';
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { NavigateFunction } from "react-router/lib/hooks";
import { Location } from "history";
import Chat from "./pages/Chat";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";

function App(): JSX.Element {
    const navigate: NavigateFunction = useNavigate()
    const location: Location = useLocation()
    const userID: string | null = localStorage.getItem("userID")

    useEffect(() => {
        if (userID !== null && !location.pathname.includes("/chat")) {
           navigate("/chat", { replace: true })
        }
        if (userID === null && location.pathname.includes("/chat")) {
           navigate("/login", { replace: true })
        }
    }, [userID, location])

    return (
        <div className="App">
            <Header/>
            <div className="App-content">
                <Routes>
                    <Route path="/" element={ <Login/> }/>
                    <Route path="/chat/*" element={ <Chat/> }/>
                    <Route path="/register" element={ <Register/> }/>
                    <Route path="/login" element={ <Login/> }/>
                    <Route path="*" element={ <NotFound/>}/>
                </Routes>
            </div>
        </div>
    )
}

export default App;