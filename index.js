const express = require("express");
const {connectToMongoDB} = require('./connect');
const URL = require("./model/url");
const cookieParser = require("cookie-parser");
const {restrictToLoggedinUserOnly,checkAuth} = require("./middleware/auth");

const path = require("path");

const staticRoute = require("./routes/staticRouter");
const urlRoute = require('./routes/url');
const userRoute = require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url")
.then(() => console.log("MongoDB Connected!"));

app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get("/test", async (req, res) => {
    const allUrls = await URL.find({});
    return res.render("home", {
        urls: allUrls,
        user: req.user,
    });
});

app.get("/url/:shortId",async (req,res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId,
    },
    {
        $push: {
            visitHistory: {
                timestamp : Date.now(),
            }
        },
    }

);
if (!entry) {
    return res.status(404).send("Short URL not found");
  }
res.redirect(entry.redirectUrl)
})




app.use("/url",restrictToLoggedinUserOnly,urlRoute);
app.use("/",checkAuth,staticRoute);
app.use("/user", userRoute);

app.listen(PORT, () => console.log("Server Started at Port 8001"));