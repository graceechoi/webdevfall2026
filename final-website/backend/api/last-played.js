import fetch from "node-fetch";

async function refreshAccessToken(refreshToken) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  return await res.json();
}

export default async function handler(req, res) {
  try {
    const refreshToken = req.headers["x-refresh-token"];

    if (!refreshToken) {
      return res.json({ error: "Not logged in" });
    }

    const tokenData = await refreshAccessToken(refreshToken);

    const trackRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      {
        headers: {
          Authorization: "Bearer " + tokenData.access_token,
        },
      }
    );

    if (trackRes.status === 429) {
      return res.json({ error: "Rate limited" });
    }

    const data = await trackRes.json();

    const item = data.items?.[0];
    const track = item?.track;

    res.json({
      track: track?.name,
      artist: track?.artists?.map((a) => a.name).join(", "),
      url: track?.external_urls?.spotify,
    });
  } catch (err) {
    res.json({ error: "Server error" });
  }
}