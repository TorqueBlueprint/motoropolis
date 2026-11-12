#!/usr/bin/env python3
"""Update state.json with the live YouTube subscriber count and the names of
people who commented WORKSHOP. Runs in GitHub Actions; needs YT_API_KEY."""
import json, os, re, sys, urllib.parse, urllib.request
from datetime import datetime, timezone

KEY = os.environ.get("YT_API_KEY", "").strip()
HANDLE = os.environ.get("YT_HANDLE", "TorqueBlueprint")
MAX_VIDEOS = 50
MAX_NAME = 24
STATE = os.path.join(os.path.dirname(__file__), "..", "state.json")


def api(path, **params):
    params["key"] = KEY
    url = "https://www.googleapis.com/youtube/v3/" + path + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)


def main():
    if not KEY:
        print("YT_API_KEY missing; nothing to do")
        return 0
    with open(STATE, encoding="utf-8") as f:
        state = json.load(f)
    ch = api("channels", part="statistics,contentDetails", forHandle=HANDLE).get("items", [])
    if not ch:
        print("channel not found:", HANDLE)
        return 1
    ch = ch[0]
    stats = ch["statistics"]
    subs = state.get("subs", 0)
    if not stats.get("hiddenSubscriberCount"):
        subs = int(stats.get("subscriberCount", subs))

    # names of people who commented "workshop" on any recent upload
    names = list(state.get("names", []))
    seen = {n.lower() for n in names}
    uploads = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    vids = [i["contentDetails"]["videoId"] for i in api("playlistItems", part="contentDetails", playlistId=uploads, maxResults=MAX_VIDEOS).get("items", [])]
    for vid in vids:
        token = None
        while True:
            params = dict(part="snippet", videoId=vid, maxResults=100, textFormat="plainText")
            if token:
                params["pageToken"] = token
            try:
                res = api("commentThreads", **params)
            except Exception as e:  # comments disabled etc.
                print("skip", vid, e)
                break
            for th in res.get("items", []):
                top = th["snippet"]["topLevelComment"]["snippet"]
                if not re.search(r"\bworkshop\b", top.get("textDisplay", ""), re.I):
                    continue
                if top.get("authorChannelId", {}).get("value") == ch["id"]:
                    continue  # skip the channel's own comments
                nm = top.get("authorDisplayName", "").lstrip("@").strip()[:MAX_NAME]
                if nm and nm.lower() not in seen:
                    names.append(nm)
                    seen.add(nm.lower())
            token = res.get("nextPageToken")
            if not token:
                break

    # public subscribers (needs the channel owner's OAuth refresh token)
    cid, csec, rtok = (os.environ.get(k, "").strip() for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"))
    if cid and csec and rtok:
        try:
            body = urllib.parse.urlencode({"client_id": cid, "client_secret": csec, "refresh_token": rtok, "grant_type": "refresh_token"}).encode()
            with urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/token", data=body), timeout=30) as r:
                tok = json.load(r)["access_token"]
            token = None
            for _ in range(20):
                q = {"part": "subscriberSnippet", "mySubscribers": "true", "maxResults": 50}
                if token:
                    q["pageToken"] = token
                req = urllib.request.Request("https://www.googleapis.com/youtube/v3/subscriptions?" + urllib.parse.urlencode(q), headers={"Authorization": "Bearer " + tok})
                with urllib.request.urlopen(req, timeout=30) as r:
                    res = json.load(r)
                for it in res.get("items", []):
                    nm = it.get("subscriberSnippet", {}).get("title", "").lstrip("@").strip()[:MAX_NAME]
                    if nm and nm.lower() not in seen:
                        names.append(nm)
                        seen.add(nm.lower())
                token = res.get("nextPageToken")
                if not token:
                    break
            print("public subscribers checked")
        except Exception as e:
            print("subscriber list unavailable:", e)

    if subs == state.get("subs") and names == state.get("names", []):
        print("no change", subs, len(names))
        return 0
    state["subs"] = subs
    state["names"] = names
    state["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    with open(STATE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("updated", subs, len(names))
    return 0


if __name__ == "__main__":
    sys.exit(main())
