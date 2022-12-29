import { createContext, useContext, useEffect, useState } from 'react'
import { IViewContext, IViewProvider } from "../types/contextTypes";

const viewContext = createContext<IViewContext | undefined>(undefined)

const ViewProvider = ({ children }: IViewProvider): JSX.Element => {
    const [width, setWidth] = useState<number>(window.innerWidth)
    const isMobile: boolean = width <= 750

    function onResize(): void {
        setWidth(window.innerWidth)
    }

    useEffect(() => {
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [])

    return (
        <viewContext.Provider value={ { width, isMobile } }>
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