import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Auth Controller :: User Not Found!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Auth Controller :: Invalid credentials!" });
        }
        if (user.role === "owner" && !user.isApproved) {
            return res.status(403).json({ msg: "Auth Controller :: Account pending approval!" });
        }
        const { refreshToken, accessToken } = user.generateTokens();
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ msg: "Auth Controller :: Login Successful", user });
    } catch (error) {
        console.error("Auth Controller :: Error Logging In User", error);
        res.status(500).json({ msg: "Auth Controller :: Server Error" });
    }
};

/**
 * User logout
 * @description Logs out a user(clear the cookies)
 * @type {(req: any, res: any) => void}
 */
const logout = ((req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ msg: "Logged out successfully" });
});

export { loginUser, logout }
