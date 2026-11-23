#!/usr/bin/env python3
"""Update state.json with the live YouTube subscriber count and the names of
people who commented WORKSHOP. Runs in GitHub Actions; needs YT_API_KEY."""
import json, os, re, sys, urllib.parse, urllib.request
from datetime import datetime, timezone

KEY = os.environ.get("YT_API_KEY", "").strip()
HANDLE = os.environ.get("YT_HANDLE", "TorqueBlueprint")
MAX_VIDEOS = 50
MAX_NAME = 24
# every city job can be picked with "WORKSHOP <job>"; the newest comment wins
JOB_TITLES = ['Bus Driver', 'Taxi Driver', 'Garbage Truck Driver', 'Garbage Collector', 'Reporter', 'Newspaper Vendor', 'Park Ranger', 'Detective', 'Court Clerk', 'Mechanic', 'Receptionist', 'Tow Truck Driver', 'Dispatcher', 'Cashier', 'Fuel Attendant', 'Tire Technician', 'Wash Attendant', 'Inspector', 'Parking Attendant', 'Warehouse Worker', 'Parts Van Driver', 'Car Salesman', 'Crusher Operator', 'Assembly Worker', 'Race Driver', 'Pit Crew', 'Real Estate Agent', 'Firefighter', 'Fire Chief', 'Doctor', 'Paramedic', 'Nurse', 'Footballer', 'Coach', 'Shopkeeper', 'Security Guard', 'Train Driver', 'Station Master', 'Toll Operator', 'Pilot', 'Air Traffic Controller', 'Flight Attendant', 'Event Host', 'DJ', 'Ship Captain', 'Crane Operator', 'Mayor', 'Architect', 'GP Driver', 'Elf', 'Market Vendor', 'Supermarket Cashier', 'Store Manager', 'Supermarket CEO']
ROLE_MAP = {"police": "police", "cop": "police", "officer": "police", "policeofficer": "police", "thief": "thief", "robber": "thief",
            "lawyer": "lawyer", "attorney": "lawyer", "judge": "judge", "bus": "bus", "busdriver": "bus", "homeless": "homeless",
            "taxi": "taxi", "taxidriver": "taxi", "garbage": "garbage"}
for _t in JOB_TITLES:
    ROLE_MAP.setdefault(re.sub(r"[^a-z]", "", _t.lower()), re.sub(r"[^a-z]", "", _t.lower()))
ROLE_MAP.update({"tow": "towtruckdriver", "towtruck": "towtruckdriver", "towdriver": "towtruckdriver", "tire": "tiretechnician", "tyre": "tiretechnician",
                 "tiretech": "tiretechnician", "tyretechnician": "tiretechnician", "wash": "washattendant", "carwash": "washattendant",
                 "salesman": "carsalesman", "carseller": "carsalesman", "carsales": "carsalesman", "racer": "racedriver", "fireman": "firefighter",
                 "doc": "doctor", "journalist": "reporter", "garbageman": "garbagecollector", "captain": "shipcaptain", "f1driver": "gpdriver",
                 "trucker": "garbagetruckdriver", "security": "securityguard", "guard": "securityguard", "clerk": "courtclerk", "parker": "parkingattendant",
                 "ranger": "parkranger", "vendor": "marketvendor", "marketseller": "marketvendor", "realtor": "realestateagent", "stewardess": "flightattendant", "steward": "flightattendant", "elves": "elf", "manager": "storemanager", "ceo": "supermarketceo", "marketceo": "supermarketceo", "supermarketmanager": "storemanager", "marketmanager": "storemanager", "marketcashier": "supermarketcashier", "supermarket": "supermarketcashier"})
_alts = sorted(ROLE_MAP, key=len, reverse=True)
_pat = "|".join(r"[\s_-]?".join(re.escape(ch) for ch in a) for a in _alts)
WORKSHOP_RE = re.compile(r"(?<![a-z])work[\s_-]*shop+s?(?![a-z])[\s:,.!#-]*(?:as\s+(?:an?\s+)?|an?\s+)?(" + _pat + r")?(?:e?s)?(?![a-z])", re.I)
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
    roles = dict(state.get("roles", {}))
    latest = {}  # name -> (time, role) of their newest WORKSHOP <role> comment
    uploads = ch["contentDetails"]["relatedPlaylists"]["uploads"]
    vids = [i["contentDetails"]["videoId"] for i in api("playlistItems", part="contentDetails", playlistId=uploads, maxResults=MAX_VIDEOS).get("items", [])]
    for vid in vids:
        token = None
        while True:
            params = dict(part="snippet,replies", videoId=vid, maxResults=100, textFormat="plainText")
            if token:
                params["pageToken"] = token
            try:
                res = api("commentThreads", **params)
            except Exception as e:  # comments disabled etc.
                print("skip", vid, e)
                break
            for th in res.get("items", []):
                # the comment itself plus its replies (people often answer under another comment)
                snips = [th["snippet"]["topLevelComment"]["snippet"]]
                rep = th.get("replies", {}).get("comments", [])
                if th["snippet"].get("totalReplyCount", 0) > len(rep):
                    try:
                        rep = api("comments", part="snippet", parentId=th["id"], maxResults=100, textFormat="plainText").get("items", [])
                    except Exception as e:
                        print("replies skip", e)
                snips += [r["snippet"] for r in reversed(rep)]  # newest reply first
                for top in snips:
                    m = WORKSHOP_RE.search(top.get("textDisplay", ""))
                    if not m:
                        continue
                    if top.get("authorChannelId", {}).get("value") == ch["id"]:
                        continue  # skip the channel's own comments
                    nm = top.get("authorDisplayName", "").lstrip("@").strip()[:MAX_NAME]
                    if nm and nm.lower() not in seen:
                        names.append(nm)
                        seen.add(nm.lower())
                    if nm and m.group(1):
                        role = ROLE_MAP[re.sub(r"[\s_-]+", "", m.group(1).lower())]
                        # the most recent comment wins, across every video (an edited comment counts from its edit time)
                        when = top.get("updatedAt") or top.get("publishedAt") or ""
                        if nm not in latest or when > latest[nm][0]:
                            latest[nm] = (when, role)
            token = res.get("nextPageToken")
            if not token:
                break
    for nm, (_, role) in latest.items():
        roles[nm] = role

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

    if subs == state.get("subs") and names == state.get("names", []) and roles == state.get("roles", {}):
        print("no change", subs, len(names))
        return 0
    state["subs"] = subs
    state["names"] = names
    # jobs pinned by hand stay put until they are removed from "locked"
    for nm, role in (state.get("locked") or {}).items():
        roles[nm] = role
    state["roles"] = roles
    state["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    with open(STATE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("updated", subs, len(names))
    return 0


if __name__ == "__main__":
    sys.exit(main())
