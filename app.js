const apiKey = "RGAPI-88e190b7-f359-4955-8f4f-08d5419d53c0";
import express from "express";
import fetch from "node-fetch";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.static("public"));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.listen(3000, () => console.log("Running on port 3000"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", async function (req, res) {
  try {
    const query = req.body.summName;
    const queryString = String(query);
    queryString.replace(/\s/g, "%20");
    const path = `https://la2.api.riotgames.com/lol/summoner/v4/summoners/by-name/${query}?api_key=${apiKey}`;
    const response = await fetch(path);
    const summData = await response.json();
    const pathRank = `https://la2.api.riotgames.com/lol/league/v4/entries/by-summoner/${summData.id}?api_key=${apiKey}`;
    const responseRank = await fetch(pathRank);
    const rankData = await responseRank.json();
    const icon = `http://ddragon.leagueoflegends.com/cdn/11.19.1/img/profileicon/${summData.profileIconId}.png`;
    res.write(`<h1>Summoner Name: ${summData.name}</h1>`);
    res.write(`<h2>Level: ${summData.summonerLevel}</h2>`);
    res.write(`<img src=${icon} alt=Profile icon>`);
    rankData.forEach((element) => {
      if(element.queueType == 'RANKED_SOLO_5x5'){
        res.write(`<h2>Current rank (SoloQ): ${element.tier} ${element.rank} ${element.leaguePoints} LP</h2>`);
      }
    });
    res.send();
  } catch (error) {
    console.log(error);
  }
});

