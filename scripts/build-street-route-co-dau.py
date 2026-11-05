"""
Tạo src/data/street-route-co-dau.json
- OSRM lấy hình học
- streetlevel tìm pano tại mỗi điểm, ưu tiên 1 mốc ngày chung gần nhất (thường 2026-07)

Chạy: python scripts/build-street-route-co-dau.py
  hoặc: npm run route:build:co-dau
"""
from __future__ import annotations

import json
import math
import time
import urllib.request
from collections import Counter
from pathlib import Path

from streetlevel import streetview

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "street-route-co-dau.json"

ORIGIN = {
    "lat": 10.927072,
    "lng": 108.065653,
    "pitch": 5,
    "fov": 75,
    "mapsUrl": "https://maps.app.goo.gl/J4nc4N2ar8FyazQRA?g_st=ac",
    "label": "Nhà Hàng Minh Thủy Phan Thiết",
}
DESTINATION = {
    "lat": 10.921752,
    "lng": 108.058067,
    "mapsUrl": "https://maps.app.goo.gl/PjF6JbqaFnbvG2iY7?g_st=ac",
    "label": "Cà Phê Sân Vườn Hát Với Nhau",
}
STEP_M = 55
RADIUS = 90


def hav(a, b):
    r = 6371000
    p = math.pi / 180
    dlat = (b["lat"] - a["lat"]) * p
    dlng = (b["lng"] - a["lng"]) * p
    la1 = a["lat"] * p
    la2 = b["lat"] * p
    h = math.sin(dlat / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlng / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def bearing(a, b):
    p = math.pi / 180
    φ1 = a["lat"] * p
    φ2 = b["lat"] * p
    Δλ = (b["lng"] - a["lng"]) * p
    y = math.sin(Δλ) * math.cos(φ2)
    x = math.cos(φ1) * math.sin(φ2) - math.sin(φ1) * math.cos(φ2) * math.cos(Δλ)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def sample_route(coords_lnglat, step_m):
    pts = [{"lat": lat, "lng": lng} for lng, lat in coords_lnglat]
    if len(pts) < 2:
        return pts
    out = [
        {
            "lat": round(pts[0]["lat"], 6),
            "lng": round(pts[0]["lng"], 6),
        }
    ]
    acc = 0.0
    target = float(step_m)
    for i in range(1, len(pts)):
        a = pts[i - 1]
        b = pts[i]
        seg = hav(a, b)
        consumed = 0.0
        while consumed < seg:
            remain = seg - consumed
            need = target - acc
            if need <= remain:
                t = (consumed + need) / seg
                out.append(
                    {
                        "lat": round(a["lat"] + (b["lat"] - a["lat"]) * t, 6),
                        "lng": round(a["lng"] + (b["lng"] - a["lng"]) * t, 6),
                    }
                )
                acc = target
                target += step_m
                consumed += need
            else:
                acc += remain
                consumed = seg
    last = {"lat": round(pts[-1]["lat"], 6), "lng": round(pts[-1]["lng"], 6)}
    if hav(out[-1], last) > 12:
        out.append(last)
    return out


def date_str(p):
    if not p or not getattr(p, "date", None):
        return None
    d = p.date
    if hasattr(d, "year"):
        return f"{d.year}-{int(d.month):02d}"
    s = str(d)
    return s[:7] if len(s) >= 7 else s


def with_retry(fn, tries=5, wait=1.2):
    last = None
    for i in range(tries):
        try:
            return fn()
        except Exception as e:
            last = e
            time.sleep(wait * (i + 1))
    raise last


def pick_pano_for_date(lat, lng, prefer_date: str | None):
    """Tìm pano gần điểm; nếu prefer_date có thì cố lấy đúng ngày (kể cả historical)."""
    p = with_retry(lambda: streetview.find_panorama(lat, lng, radius=RADIUS))
    if not p:
        return None
    if not prefer_date or date_str(p) == prefer_date:
        return p
    # Thử historical cùng vị trí
    for h in p.historical or []:
        if date_str(h) == prefer_date:
            hid = h.id
            full = with_retry(lambda hid=hid: streetview.find_panorama_by_id(hid))
            return full or h
    # Thử vài neighbor rồi historical
    for n in (p.neighbors or [])[:12]:
        nid = n.id
        try:
            np = with_retry(lambda nid=nid: streetview.find_panorama_by_id(nid))
        except Exception:
            continue
        if not np:
            continue
        if date_str(np) == prefer_date:
            return np
        for h in np.historical or []:
            if date_str(h) == prefer_date:
                hid = h.id
                try:
                    full = with_retry(lambda hid=hid: streetview.find_panorama_by_id(hid))
                except Exception:
                    full = None
                return full or h
        time.sleep(0.08)
    return None  # không có đúng ngày tại điểm này


def main():
    osrm_url = (
        "https://router.project-osrm.org/route/v1/driving/"
        f"{ORIGIN['lng']},{ORIGIN['lat']};{DESTINATION['lng']},{DESTINATION['lat']}"
        "?overview=full&geometries=geojson"
    )
    print("OSRM…")
    with urllib.request.urlopen(osrm_url, timeout=60) as resp:
        osrm = json.loads(resp.read().decode("utf-8"))
    if osrm.get("code") != "Ok":
        raise SystemExit(osrm)
    coords = osrm["routes"][0]["geometry"]["coordinates"]
    distance = round(osrm["routes"][0]["distance"])
    samples = sample_route(coords, STEP_M)
    print(f"distance={distance}m samples={len(samples)}")

    # Pass 1: khảo sát ngày tại mỗi điểm (pano mới nhất)
    print("Survey dates…")
    survey = []
    for i, s in enumerate(samples):
        try:
            p = with_retry(lambda: streetview.find_panorama(s["lat"], s["lng"], radius=RADIUS))
        except Exception as e:
            print(f"  [{i+1}/{len(samples)}] ERR {e}")
            survey.append(None)
            continue
        d = date_str(p) if p else None
        survey.append(d)
        print(f"  [{i+1}/{len(samples)}] {d or 'NONE'} {p.id[:12] if p else ''}")
        time.sleep(0.12)

    counts = Counter([d for d in survey if d])
    print("DATE COUNTS", dict(counts))
    if not counts:
        raise SystemExit("Không tìm thấy Street View dọc tuyến")

    # Chọn mốc ngày gần nhất có coverage >= 70% điểm
    ranked = sorted(counts.keys(), reverse=True)  # YYYY-MM lexicographic ok
    prefer = None
    for d in ranked:
        if counts[d] / len(samples) >= 0.7:
            prefer = d
            break
    if not prefer:
        prefer = ranked[0]
    print(f"Using common recent date: {prefer}")

    # Pass 2: lấy pano đúng ngày
    frames = []
    for i, s in enumerate(samples):
        try:
            p = pick_pano_for_date(s["lat"], s["lng"], prefer)
        except Exception as e:
            print(f"  skip {i} err {e}")
            continue
        if not p:
            print(f"  skip {i} no {prefer}")
            continue
        frames.append(
            {
                "lat": round(p.lat, 6),
                "lng": round(p.lon, 6),
                "heading": 0,
                "pitch": 5,
                "fov": 75,
                "pano": p.id,
                "imageDate": date_str(p) or prefer,
            }
        )
        print(f"  frame {len(frames)} {date_str(p)} {p.id[:14]}")
        time.sleep(0.15)

    if len(frames) < 3:
        raise SystemExit("Quá ít frame")

    # Dedup sát nhau
    dedup = [frames[0]]
    for f in frames[1:]:
        if hav(dedup[-1], f) > 12:
            dedup.append(f)
    frames = dedup

    for i, f in enumerate(frames):
        nxt = frames[min(i + 1, len(frames) - 1)]
        ratio = i / max(1, len(frames) - 1)
        if ratio >= 0.95:
            ms, msi = "Tiệc", 3
        elif ratio >= 0.66:
            ms, msi = "Đầu đường rẽ", 2
        elif ratio >= 0.33:
            ms, msi = "Giữa đường", 1
        else:
            ms, msi = "Đầu đường", 0
        f["heading"] = round(bearing(f, nxt), 1)
        f["milestone"] = ms
        f["milestoneIndex"] = msi

    def pick(r):
        return frames[min(len(frames) - 1, int(len(frames) * r))]

    # Điểm đầu đường rẽ vào nơi tổ chức (Maps: ArMR3hF6piCm5Pd48)
    TURN_IN = {
        "lat": 10.924213,
        "lng": 108.057785,
        "heading": 134.0,
        "pano": "mXzLXt6k-pBC_A47au0oBg",
        "mapsUrl": "https://maps.app.goo.gl/ArMR3hF6piCm5Pd48?g_st=ac",
    }
    # Gắn frame gần nhất với điểm đường rẽ
    turn_idx = min(
        range(len(frames)),
        key=lambda i: hav(frames[i], TURN_IN),
    )
    frames[turn_idx] = {
        **frames[turn_idx],
        "lat": TURN_IN["lat"],
        "lng": TURN_IN["lng"],
        "heading": TURN_IN["heading"],
        "pano": TURN_IN["pano"],
        "milestone": "Đầu đường rẽ",
        "milestoneIndex": 2,
    }

    milestones = [
        {
            "label": "Đầu đường",
            "lat": frames[0]["lat"],
            "lng": frames[0]["lng"],
            "heading": frames[0]["heading"],
            "pano": frames[0]["pano"],
        },
        {
            "label": "Giữa đường",
            "lat": pick(0.33)["lat"],
            "lng": pick(0.33)["lng"],
            "heading": pick(0.33)["heading"],
            "pano": pick(0.33)["pano"],
        },
        {
            "label": "Đầu đường rẽ",
            "lat": TURN_IN["lat"],
            "lng": TURN_IN["lng"],
            "heading": TURN_IN["heading"],
            "pano": TURN_IN["pano"],
            "mapsUrl": TURN_IN["mapsUrl"],
        },
        {
            "label": "Tiệc",
            "lat": frames[-1]["lat"],
            "lng": frames[-1]["lng"],
            "heading": frames[-1]["heading"],
            "pano": frames[-1]["pano"],
        },
    ]

    dated = sum(1 for f in frames if f.get("imageDate") == prefer)
    out = {
        "source": "osrm+streetlevel",
        "note": f"Tuyến cô dâu — tất cả pano ưu tiên {prefer}",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "preferImageDate": prefer,
        "framesWithPreferDate": dated,
        "dateSurvey": dict(counts),
        "origin": {**ORIGIN, "pano": frames[0]["pano"], "imageDate": prefer},
        "destination": DESTINATION,
        "distanceMeters": distance,
        "stepMs": 1200,
        "milestones": milestones,
        "frames": frames,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {OUT} frames={len(frames)} dated={dated}/{len(frames)} prefer={prefer}")


if __name__ == "__main__":
    main()
