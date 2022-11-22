import { ReactElement } from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

function renderWithRouting(ui: ReactElement, path: string): void {
    window.history.pushState({}, "", path)

    render(ui, { wrapper: BrowserRouter })
}

export default renderWithRouting