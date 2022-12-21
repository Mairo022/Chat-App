import { SubmitHandler, useForm } from "react-hook-form";
import { ILogin, ILoginForm, IUser } from "../types/loginTypes";
import { loginRequest } from "../services/loginServices";
import { NavLink, useNavigate } from "react-router-dom";
import { NavigateFunction } from "react-router/lib/hooks";
import "../styles/pages/LoginRegister.sass";
import HeaderApp from "../components/HeaderApp";

function Login(): JSX.Element {
    const URL: string = process.env.REACT_APP_PROXY as string
    const navigate: NavigateFunction = useNavigate()

    const { register, handleSubmit, setError, formState: { errors }, clearErrors } = useForm<ILoginForm>()
    const errorMsg = (error: string): JSX.Element => <span className="form__error">{ errors[error].message }</span>

    const onSubmit: SubmitHandler<IUser> = (user: IUser) =>
        loginRequest(user, URL)
            .then(response => {
                onLogin(response.data)
            })
            .catch(error => {
                setError("apiError", { message: error.response.data.message })
            })

    function onLogin(user: ILogin): void {
        localStorage.setItem('userID', user.userID)
        localStorage.setItem('username', user.username)

        navigate("/chat")
    }

    return (
        <div className="Login">
            <div className="header">
                <HeaderApp/>
            </div>
            <form className="form" onSubmit={ handleSubmit(onSubmit) }>
                <input className="form__username" placeholder="Username"
                       { ...register("username", { required: "Username is required" }) }
                />

                <input className="form__password" placeholder="Password" type="password"
                       { ...register("password", { required: "Password is required" }) }
                />

                { errors.apiError ? errorMsg("apiError") : "" }

                <input className="form__submit" type="submit" value="Login" onClick={ () => { clearErrors() } }/>
            </form>

            <div className="register">
                <div className="register__text">Don't have an account?&#0160;</div>
                <NavLink className="register__link" to="/register">
                    <p className="register__link__text">Register now</p>
                </NavLink>
            </div>
        </div>
    )
}

export default Login