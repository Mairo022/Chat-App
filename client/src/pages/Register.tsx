import { SubmitHandler, useForm } from "react-hook-form";
import { IUser, IRegisterForm } from "../types/registerTypes";
import { registerRequest } from "../services/registerServices";
import { NavLink, useNavigate } from "react-router-dom";
import { NavigateFunction } from "react-router/lib/hooks";
import "../styles/pages/LoginRegister.sass";

function Register(): JSX.Element {
    const URL: string = process.env.REACT_APP_PROXY as string
    const navigate: NavigateFunction = useNavigate()

    const { register, handleSubmit, setError, formState: { errors }, clearErrors } = useForm<IRegisterForm>()
    const errorMsg = (error: string): JSX.Element => <span className="register-content-form-error">{ errors[error].message }</span>

    const onSubmit: SubmitHandler<IUser> = (user: IUser) =>
        registerRequest(user, URL)
            .then(() => {
                navigate('/login', { replace: true })
            })
            .catch(error => {
                setError("apiError", { message: error.response.data.message })
            })

    return (
        <div className="register">

            <form className="register-form" onSubmit={ handleSubmit(onSubmit) }>

                <input className="register-form-username" placeholder="Username"
                       { ...register("username", {
                           required: "Username is required" ,
                           minLength: {
                               value: 4,
                               message: "Minimum name length is 4 characters"
                           },
                           maxLength: {
                               value: 20,
                               message: "Maximum name length is 20 characters"
                           }
                       }) }
                />
                { errors.username ? errorMsg("username") : "" }

                <input className="register-form-password" placeholder="Password" type="password"
                       { ...register("password", {
                           required: "Password is required",
                           minLength: {
                               value: 8,
                               message: "Minimum password length is 8 characters"
                           },
                           maxLength: {
                               value: 255,
                               message: "Maximum password length is 255 characters"
                           }
                       }) }
                />
                { errors.password ? errorMsg("password") : "" }

                { errors.apiError ? errorMsg("apiError") : "" }

                <input className="register-form-submit" type="submit" value="Register" onClick={ () => { clearErrors() } }/>

            </form>

            <NavLink className="register-login_link" to="/login">
                <p className="register-login_link-text">Login</p>
            </NavLink>

        </div>
    )
}

export default Register