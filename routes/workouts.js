import { Router } from "express";
import { teamData } from "../data/index.js";
import * as helpers from "../helpers.js";

const router = Router();
router
  .route("/")
  .get(async (req, res) => {
    //code here for GET
    try {
      const teamList = await teamData.getAllTeams();
      return res.json(teamList);
    } catch (e) {
      return res.status(404).json({ error: e.message || e });
    }
  })
  .post(async (req, res) => {
    //code here for POST
    // console.log("Available exports in teamData:", teamData);

    const team = req.body;

    if (!team || Object.keys(team).length === 0) {
      return res
        .status(400)
        .json({ error: "There are no fields in the request body" });
    }

    try {
      helpers.checkTeam(
        team.name,
        team.sport,
        team.yearFounded,
        team.city,
        team.state,
        team.stadium,
        team.championshipsWon,
        team.players
      );
    } catch (e) {
      return res.status(400).json({ error: e.message || e });
    }

    try {
      const newTeam = await teamData.createTeam(
        team.name,
        team.sport,
        team.yearFounded,
        team.city,
        team.state,
        team.stadium,
        team.championshipsWon,
        team.players
      );
      return res.status(200).json(newTeam);
    } catch (e) {
      return res.status(500).json({ error: e.message || e });
    }
  });

router
  .route("/:teamId")
  .get(async (req, res) => {
    //code here for GET
    // console.log(req.params.id);
    try {
      req.params.teamId = helpers.checkId(req.params.teamId);
    } catch (e) {
      return res.status(400).json({ error: e || e });
    }
    try {
      const team = await teamData.getTeamById(req.params.teamId);
      return res.json(team);
    } catch (e) {
      return res.status(404).json({ error: e.message || e });
    }
  })
  .delete(async (req, res) => {
    //code here for DELETE
    try {
      req.params.id = helpers.checkId(req.params.teamId);
    } catch (e) {
      return res.status(400).json({ error: e.message || e });
    }
    try {
      const team = await teamData.getTeamById(req.params.teamId);
    } catch (e) {
      return res.status(404).json({ error: e.message || e });
    }
    try {
      const removedTeam = await teamData.removeTeam(req.params.teamId);
      const returnObj = { _id: req.params.teamId, deleted: true };
      return res.json(returnObj);
    } catch (e) {
      return res.status(500).json({ error: e.message || e });
    }
  })
  .put(async (req, res) => {
    //code here for PUT
    try {
      req.params.teamId = helpers.checkId(req.params.teamId);
    } catch (e) {
      return res.status(400).json({ error: e.message || e });
    }
    try {
      const team = await teamData.getTeamById(req.params.teamId);
    } catch (e) {
      return res.status(404).json({ error: e.message || e });
    }
    const teamBody = req.body;
    if (!teamBody || Object.keys(teamBody).length === 0) {
      return res
        .status(400)
        .json({ error: "There are no fields in the request body" });
    }
    try {
      helpers.checkTeam(
        teamBody.name,
        teamBody.sport,
        teamBody.yearFounded,
        teamBody.city,
        teamBody.state,
        teamBody.stadium,
        teamBody.championshipsWon,
        teamBody.players
      );
    } catch (e) {
      return res.status(400).json({ error: e.message || e });
    }

    try {
      // const getTeam = await teamData.getTeamById(req.params.teamId);
      const team = await teamData.updateTeam(
        req.params.teamId,
        teamBody.name,
        teamBody.sport,
        teamBody.yearFounded,
        teamBody.city,
        teamBody.state,
        teamBody.stadium,
        teamBody.championshipsWon,
        teamBody.players
      );

      return res.json(team);
    } catch (e) {
      return res.status(500).json({ error: e.message || e });
    }
  });

export default router;
