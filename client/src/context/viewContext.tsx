import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { IViewContext, IViewProvider } from "../types/contextTypes";

const viewContext = createContext<IViewContext | undefined>(undefined)

const ViewProvider = ({ children }: IViewProvider): JSX.Element => {
    const [width, setWidth] = useState<number>(window.innerWidth)
    const isMobile: boolean = width <= 750

    const [showMessages, setShowMessages] = useState<boolean>(!isMobile)
    const widthRef = useRef<number>(window.innerWidth)

    const onResize = (): void => {
        const windowWidth: number = window.innerWidth

        if (widthRef.current <= 750 && windowWidth > 750) {
            handleResize(true, windowWidth)
        }
        if (widthRef.current > 750 && windowWidth <= 750) {
            handleResize(false, windowWidth)
        }
    }

    function handleResize(showMessages: boolean, width: number): void {
        widthRef.current = width
        setShowMessages(showMessages)
        setWidth(width)
    }

    useEffect(() => {
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [])

    return (
        <viewContext.Provider value={ { width, isMobile, showMessages, setShowMessages } }>
            { children }
        </viewContext.Provider>
    )
}

const useView = (): IViewContext => {
    const context = useContext(viewContext)

    if (context === undefined) {
        throw new Error("viewContext is undefined")
    }

    return context
}

export {
    ViewProvider,
    useView
}