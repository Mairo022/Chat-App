import express from "express";
import userController from "./userController";
import catchErrors from "../utils/errorHandler";

const router = express.Router()

router.post("/login", catchErrors(userController.login))
router.post("/register", catchErrors(userController.register))


export {
    router as userRoute
}