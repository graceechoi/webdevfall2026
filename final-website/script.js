document.addEventListener('DOMContentLoaded', function () {
  const cardWrapper = document.querySelector('.flip-card-wrapper');
  if (!cardWrapper) return;

  const targetDate = new Date('2026-05-15T09:00:00');
  const dayNumber = cardWrapper.querySelector('.day-number');

  function getDaysUntil() {
    const now = new Date();
    const diff = Math.max(0, targetDate - now);
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  function render() {
    dayNumber.textContent = getDaysUntil();
  }

  render();
  setInterval(render, 60 * 1000);
});

/***********************
 * CONFIG
 ***********************/
const clientId = "94c4276f63b1422da549e351e5991b6e";
const clientSecret = "fc877cf7de63444caee87de03a2d347d";
const redirectUri = "http://127.0.0.1:3000";
const scope = "user-read-recently-played";

const code = "AQAgLNnDI07Z6hVFjQcHADaBZSvznOxPbkDdyMR975T-B7RqGIHaBlHvX717XGaeHIS5YRPdmP8NUjDwePhAyEa4vicjfBmvHsmdOOOuJwkXzJjUz1SGTNyjxlFO1g6VNR_FFK0XctTKEkpbAeWS6ecgf3XmGz1wC0361CftzVMj-IUX0XRhupFqhsvFV2QCCXN1EQ";

async function run() {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(clientId + ":" + clientSecret)
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    })
  });

  const data = await res.json();

  console.log("SAVE THIS REFRESH TOKEN:");
  console.log(data.refresh_token);
}

run();