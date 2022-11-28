import { SubmitHandler, useForm } from "react-hook-form";
import { ILogin, ILoginForm, IUser } from "../types/loginTypes";
import { loginRequest } from "../services/loginServices";
import { NavLink, useNavigate } from "react-router-dom";
import { NavigateFunction } from "react-router/lib/hooks";
import "../styles/pages/LoginRegister.sass";

function Login(): JSX.Element {
    const URL: string = process.env.REACT_APP_PROXY as string
    const navigate: NavigateFunction = useNavigate()

    const { register, handleSubmit, setError, formState: { errors }, clearErrors } = useForm<ILoginForm>()
    const errorMsg = (error: string): JSX.Element => <span className="login-content-form-error">{ errors[error].message }</span>

    const onSubmit: SubmitHandler<IUser> = (user: IUser) =>
        loginRequest(user, URL)
            .then(response => {
                onLogin(response.data)
            })
            .catch(error => {
                console.log(error)
                setError("apiError", { message: error.response.data.message })
            })

    function onLogin(user: ILogin): void {
        localStorage.setItem('userID', user.userID)
        localStorage.setItem('username', user.username)

        navigate("/chat")
    }

    return (
        <div className="login">

            <form className="login-form" onSubmit={ handleSubmit(onSubmit) }>

                <input className="login-form-username" placeholder="Username"
                       { ...register("username", { required: "Username is required" }) }
                />

                <input className="login-form-password" placeholder="Password" type="password"
                       { ...register("password", { required: "Password is required" }) }
                />

                { errors.apiError ? errorMsg("apiError") : "" }

                <input className="login-form-submit" type="submit" value="Login" onClick={ () => { clearErrors() } }/>

            </form>
            <NavLink className="login-register_link" to="/register">
                <p className="login-register_link-text">Register</p>
            </NavLink>

        </div>
    )
}

export default Login