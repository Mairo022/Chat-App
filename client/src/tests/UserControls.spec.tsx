import { fireEvent, screen } from '@testing-library/react'
import { ViewProvider } from "../context/viewContext";
import UserControls from "../components/UserControls"
import userEvent from "@testing-library/user-event";
import renderWithRouting from "../test-utils";

describe("UserControls", () => {
    describe("Profile window", () => {
        beforeEach(() => {
            renderWithRouting(
                <ViewProvider>
                    <UserControls username="Carmen0!--" userID="EEE-999000999"/>
                </ViewProvider>,
                "/chat")
        })

        test("Clicking 'Profile' opens profile window", () => {
            userEvent.click(screen.getByText(/Profile/))

            const closeBtn = screen.getByText(/Close/)
            expect(closeBtn).toBeInTheDocument()
        })

        test("Clicking 'Profile' twice closes profile window", () => {
            userEvent.click(screen.getByText(/Profile/))
            userEvent.click(screen.getByText(/Profile/))

            const closeBtn = screen.queryByText(/Close/)
            expect(closeBtn).not.toBeInTheDocument()
        })

        test("Clicking 'Close' closes profile window", () => {
            userEvent.click(screen.getByText(/Profile/))
            userEvent.click(screen.getByText(/Close/))

            const closeBtn = screen.queryByText(/Close/)
            expect(closeBtn).not.toBeInTheDocument()
        })


        test("Clicking outside of profile window closes profile window", () => {
            userEvent.click(screen.getByText(/Profile/))
            fireEvent.click(document.body)

            const closeBtn = screen.queryByText(/Close/)
            expect(closeBtn).not.toBeInTheDocument()
        })

        it("Displays correct username", () => {
            userEvent.click(screen.getByText(/Profile/))

            const username = screen.getByText(/Carmen0!--/)
            expect(username).toBeInTheDocument()
        })

        it("Displays correct userID", () => {
            userEvent.click(screen.getByText(/Profile/))

            const userID = screen.getByText(/EEE-999000999/)
            expect(userID).toBeInTheDocument()
        })

        test("Logging out redirects to '/login'", () => {
            userEvent.click(screen.getByText(/log out/i))

            const path = window.location.pathname
            expect(path).toEqual("/login")
        })

        test("Logging out clears localStorage", () => {
            const localStorage = window.localStorage
            localStorage.setItem('userID', "EEE-999000999")
            localStorage.setItem('username', "Carmen0!--")

            userEvent.click(screen.getByText(/log out/i))

            expect(localStorage.length).toEqual(0)
        })

    })
})