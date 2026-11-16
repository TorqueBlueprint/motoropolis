#!/usr/bin/env python3
"""One-off: print every public comment (and reply) on recent uploads as JSON lines, for content research."""
import json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import update_state as u
ch = u.api("channels", part="contentDetails", forHandle=u.HANDLE)["items"][0]
up = ch["contentDetails"]["relatedPlaylists"]["uploads"]
items = u.api("playlistItems", part="contentDetails,snippet", playlistId=up, maxResults=50).get("items", [])
out = []
for it in items:
    vid = it["contentDetails"]["videoId"]; title = it["snippet"]["title"]; tok = None
    while True:
        p = dict(part="snippet,replies", videoId=vid, maxResults=100, textFormat="plainText")
        if tok: p["pageToken"] = tok
        try: res = u.api("commentThreads", **p)
        except Exception as e: break
        for th in res.get("items", []):
            sn = [th["snippet"]["topLevelComment"]["snippet"]] + [r["snippet"] for r in th.get("replies", {}).get("comments", [])]
            for s in sn:
                if s.get("authorChannelId", {}).get("value") == ch["id"]: continue
                out.append({"v": title[:50], "a": s.get("authorDisplayName"), "t": s.get("textDisplay"), "d": s.get("publishedAt"), "l": s.get("likeCount")})
        tok = res.get("nextPageToken")
        if not tok: break
os.makedirs("out", exist_ok=True)
json.dump(out, open("out/comments.json", "w"), ensure_ascii=False, indent=0)
print(len(out), "comments")
