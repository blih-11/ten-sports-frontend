const axios = require('axios');
const League = require('../models/League');
const Team = require('../models/Team');
const Standing = require('../models/Standing');
const Fixture = require('../models/Fixture');

const BASE_URL = 'https://v3.football.api-sports.io';
const BASKETBALL_URL = 'https://v1.basketball.api-sports.io';
const NBA_URL = 'https://v2.nba.api-sports.io';

function footballClient() {
  return axios.create({
    baseURL: BASE_URL,
    headers: { 'x-apisports-key': process.env.SPORTS_API_KEY },
  });
}

function basketballClient() {
  return axios.create({
    baseURL: BASKETBALL_URL,
    headers: { 'x-apisports-key': process.env.SPORTS_API_KEY },
  });
}

// ── STANDINGS ─────────────────────────────────────────────────────────────────
async function syncStandings(league) {
  try {
    const client = footballClient();
    const res = await client.get('/standings', {
      params: { league: league.apiId, season: league.season },
    });

    const standingsData = res.data?.response?.[0]?.league?.standings?.[0];
    if (!standingsData?.length) {
      console.log(`[sync] No standings for ${league.name}`);
      return;
    }

    // Delete old standings for this league+season and replace
    await Standing.deleteMany({ league: league._id, season: league.season });

    const docs = standingsData.map(s => ({
      league:       league._id,
      season:       league.season,
      rank:         s.rank,
      points:       s.points,
      played:       s.all.played,
      won:          s.all.win,
      drawn:        s.all.draw,
      lost:         s.all.lose,
      goalsFor:     s.all.goals.for,
      goalsAgainst: s.all.goals.against,
      goalDiff:     s.goalsDiff,
      form:         s.form || '',
      description:  s.description || '',
      team: {
        name:  s.team.name,
        logo:  s.team.logo,
        apiId: s.team.id,
      },
    }));

    await Standing.insertMany(docs);
    await League.findByIdAndUpdate(league._id, { lastSynced: new Date() });
    console.log(`[sync] Standings updated for ${league.name} (${docs.length} teams)`);
  } catch (err) {
    console.error(`[sync] Standings error for ${league.name}:`, err.message);
  }
}

// ── FIXTURES ──────────────────────────────────────────────────────────────────
// Fetches the next 10 and last 10 fixtures per league to stay within free quota
async function syncFixtures(league) {
  try {
    const client = footballClient();

    const [nextRes, lastRes] = await Promise.all([
      client.get('/fixtures', { params: { league: league.apiId, season: league.season, next: 10 } }),
      client.get('/fixtures', { params: { league: league.apiId, season: league.season, last: 10 } }),
    ]);

    const fixtures = [
      ...(nextRes.data?.response || []),
      ...(lastRes.data?.response || []),
    ];

    for (const f of fixtures) {
      const doc = {
        apiId:  f.fixture.id,
        league: league._id,
        season: league.season,
        round:  f.league.round || '',
        date:   new Date(f.fixture.date),
        status: {
          long:    f.fixture.status.long,
          short:   f.fixture.status.short,
          elapsed: f.fixture.status.elapsed,
        },
        homeTeam: {
          name:  f.teams.home.name,
          logo:  f.teams.home.logo,
          apiId: f.teams.home.id,
        },
        awayTeam: {
          name:  f.teams.away.name,
          logo:  f.teams.away.logo,
          apiId: f.teams.away.id,
        },
        score: {
          home:   f.goals.home,
          away:   f.goals.away,
          htHome: f.score.halftime.home,
          htAway: f.score.halftime.away,
        },
        venue: f.fixture.venue?.name || '',
      };

      await Fixture.findOneAndUpdate(
        { apiId: f.fixture.id },
        { $set: doc },
        { upsert: true, new: true }
      );
    }

    console.log(`[sync] Fixtures updated for ${league.name} (${fixtures.length} fixtures)`);
  } catch (err) {
    console.error(`[sync] Fixtures error for ${league.name}:`, err.message);
  }
}

// ── LIVE FIXTURES ─────────────────────────────────────────────────────────────
// Called more frequently — only fetches currently live matches to get scores/events
async function syncLiveFixtures() {
  try {
    const client = footballClient();
    const res = await client.get('/fixtures', { params: { live: 'all' } });
    const fixtures = res.data?.response || [];

    for (const f of fixtures) {
      await Fixture.findOneAndUpdate(
        { apiId: f.fixture.id },
        {
          $set: {
            'status.long':    f.fixture.status.long,
            'status.short':   f.fixture.status.short,
            'status.elapsed': f.fixture.status.elapsed,
            'score.home':     f.goals.home,
            'score.away':     f.goals.away,
            events: (f.events || []).map(e => ({
              minute: e.time.elapsed,
              type:   e.type,
              detail: e.detail,
              team:   e.team.name,
              player: e.player.name,
              assist: e.assist?.name || null,
            })),
          },
        },
        { upsert: false } // only update existing, don't create for unknown leagues
      );
    }

    if (fixtures.length > 0) {
      console.log(`[sync] Live: updated ${fixtures.length} live fixtures`);
    }
  } catch (err) {
    console.error('[sync] Live fixtures error:', err.message);
  }
}

// ── MAIN SYNC ─────────────────────────────────────────────────────────────────
// Called by cron — runs standings + fixtures for all active API leagues
async function runSync() {
  if (!process.env.SPORTS_API_KEY) {
    console.log('[sync] SPORTS_API_KEY not set — skipping sync');
    return;
  }

  console.log('[sync] Starting sports data sync...');
  const leagues = await League.find({ isActive: true, isManual: false });

  for (const league of leagues) {
    await syncStandings(league);
    await syncFixtures(league);
    // Small delay between leagues to respect 10 req/min free tier limit
    await new Promise(r => setTimeout(r, 7000));
  }

  console.log('[sync] Sync complete');
}

module.exports = { runSync, syncLiveFixtures };
