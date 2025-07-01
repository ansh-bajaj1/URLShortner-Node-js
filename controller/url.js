const { nanoid } = require("nanoid");
const URL = require("../model/url");

async function handleGenerateNewShortURL(req, res) {
  const shortID = nanoid(8);
  const body = req.body;

  if (!body.url) return res.status(400).json({ error: "URL is required" });

  await URL.create({
    shortId: shortID,
    redirectUrl: body.url,
    visitHistory: [],
    createdBy: req.user._id,
  });

  const allUrls = await URL.find({ createdBy: req.user._id });

  return res.render("home", {
    id: shortID,
    urls: allUrls,
    user: req.user,
  });
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId: shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}
module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};
