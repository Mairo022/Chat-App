interface IViewProvider {
    children: JSX.Element | JSX.Element[]
}

interface IViewContext {
    width: number
    isMobile: boolean
}

export type {
    IViewProvider,
    IViewContext
}