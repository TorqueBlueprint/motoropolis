# Motoropolis

A 3D city that grows with the TorqueBlueprint YouTube channel: every subscriber adds a car, every milestone opens a building.

## Update the city
Edit `state.json`: change `subs`, `updated` and the `names` list (Wall of Mechanics), then commit. The site updates in about a minute.

## Automatic updates
A GitHub Action (`.github/workflows/update-state.yml`) runs every 30 minutes. It reads the channel's live subscriber count and the names of everyone who commented WORKSHOP on the latest videos (YouTube Data API v3), and updates `state.json`. It needs a repository secret named `YT_API_KEY`. Names added by hand are kept.

The page checks `state.json` again every 2 minutes, so open pages celebrate new subscribers live.
