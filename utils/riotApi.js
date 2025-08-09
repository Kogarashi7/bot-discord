const axios = require('axios');
require('dotenv').config();

const riotAccountAPI = axios.create({
  baseURL: 'https://americas.api.riotgames.com',
  headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
});

const riotSummonerAPI = axios.create({
  baseURL: 'https://la1.api.riotgames.com',
  headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
});

module.exports = {
  async getAccountByRiotId(gameName, tagLine) {
    const res = await riotAccountAPI.get(`/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`);
    return res.data;
  },

  async getSummonerByPuuid(puuid) {
    const res = await riotSummonerAPI.get(`/lol/summoner/v4/summoners/by-puuid/${puuid}`);
    return res.data;
  },

  async getRankedData(summonerId) {
    const res = await riotSummonerAPI.get(`/lol/league/v4/entries/by-summoner/${summonerId}`);
    return res.data;
  }
};
