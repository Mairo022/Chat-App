import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import React from 'react';
import { ViewProvider } from "./context/viewContext";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ViewProvider>
                <App/>
            </ViewProvider>
        </BrowserRouter>
    </React.StrictMode>
)