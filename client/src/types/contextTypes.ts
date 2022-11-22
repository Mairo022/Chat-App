interface IViewProvider {
    children: JSX.Element | JSX.Element[]
}

interface IViewContext {
    width: number
    isMobile: boolean
    showMessages: boolean
    setShowMessages: (state: boolean) => void
}

export type {
    IViewProvider,
    IViewContext
}