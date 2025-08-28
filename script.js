// Configuração do Jellyfin externo
const JELLYFIN_URL = "http://marceloflix.duckdns.org:8096";
const USERNAME = "WELISON";
const PASSWORD = "1234";

let accessToken = "";

async function login() {
  const res = await fetch(`${JELLYFIN_URL}/Users/authenticatebyname`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Emby-Authorization":
        'MediaBrowser Client="CustomApp", Device="Browser", DeviceId="1234", Version="1.0"',
    },
    body: JSON.stringify({
      Username: USERNAME,
      Pw: PASSWORD,
    }),
  });

  const data = await res.json();
  accessToken = data.AccessToken;
  return data.User.Id;
}

async function carregarFilmes(userId) {
  const res = await fetch(
    `${JELLYFIN_URL}/Users/${userId}/Items?IncludeItemTypes=Movie&SortBy=SortName&Recursive=true`,
    {
      headers: { "X-MediaBrowser-Token": accessToken },
    }
  );
  const data = await res.json();
  return data.Items;
}

function mostrarFilmes(filmes) {
  const container = document.getElementById("filmes");
  container.innerHTML = "";

  filmes.forEach((filme) => {
    const div = document.createElement("div");
    div.className = "item";

    const img = document.createElement("img");
    img.src = `${JELLYFIN_URL}/Items/${filme.Id}/Images/Primary?maxHeight=300&tag=${filme.ImageTags?.Primary || ""}&quality=90`;

    div.appendChild(img);
    div.onclick = () => {
      window.open(`${JELLYFIN_URL}/web/index.html#!/details?id=${filme.Id}`, "_blank");
    };

    container.appendChild(div);
  });
}

// Execução inicial
(async () => {
  try {
    const userId = await login();
    const filmes = await carregarFilmes(userId);
    mostrarFilmes(filmes);
  } catch (e) {
    console.error("Erro ao conectar no Jellyfin:", e);
    alert("Não foi possível conectar ao Jellyfin.");
  }
})();
