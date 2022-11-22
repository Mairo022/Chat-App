import express from 'express'
import catchErrors from "../utils/errorHandler";
import chatController from "./chatController";
import { jwtAuth } from "../../middleware/authMiddleware";

const router = express.Router()

router.post("/send-message", jwtAuth, catchErrors(chatController.sendMessage))
router.post("/get-messages", jwtAuth, catchErrors(chatController.getMessages))
router.post("/search-user", jwtAuth, catchErrors(chatController.searchUser))

export {
    router as chatRoute
}