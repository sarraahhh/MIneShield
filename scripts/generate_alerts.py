import csv, json, random, datetime

# Telangana Open-Pit Mines
MINES = [
    ("Kothagudem Open Cast Project", 17.5531, 80.6192, "Bhadradri Kothagudem"),
    ("Manuguru OCP", 17.8983, 80.8264, "Khammam"),
    ("Ramagundam OC-II", 18.7604, 79.4751, "Peddapalli"),
    ("Ramagundam OC-III", 18.7671, 79.4794, "Peddapalli"),
    ("Godavarikhani OC-IV", 18.7923, 79.4601, "Peddapalli"),
    ("Bellampalli OC-II", 19.0724, 79.4931, "Mancherial"),
    ("Bhupalpally OCP", 18.4367, 79.8651, "Jayashankar Bhupalpally"),
]

ALERT_TYPES = [
    "Rockfall",
    "Slope Failure",
    "Dust Hazard",
    "Heat Stress",
    "Flooding Risk",
    "Equipment Overload",
]

def generate_alerts(n=40):
    alerts = []
    for i in range(1, n + 1):
        mine, lat, lon, district = random.choice(MINES)
        alert_type = random.choice(ALERT_TYPES)
        risk_level = random.choices(["Low", "Medium", "High"], weights=[0.3, 0.45, 0.25])[0]
        confidence = random.randint(60, 95)
        temperature = round(random.uniform(30, 45), 1)
        dust_index = random.randint(70, 180)
        vibration = round(random.uniform(0.2, 0.9), 2)
        rainfall = random.randint(0, 50)
        timestamp = (datetime.datetime.utcnow() - datetime.timedelta(minutes=random.randint(0, 120))).isoformat() + "Z"

        msg_templates = {
            "Rockfall": "Loose rocks detected near upper bench area; advise slope check.",
            "Slope Failure": "Ground movement detected on south pit wall; potential slide risk.",
            "Dust Hazard": "Dust levels above safe limit; visibility may reduce for drivers.",
            "Heat Stress": "Surface heat high; limit crew exposure near haul road.",
            "Flooding Risk": "Rain accumulation near pit floor; drainage pumps recommended.",
            "Equipment Overload": "Machinery vibration above threshold; inspect excavator joints."
        }

        message = msg_templates[alert_type]

        alerts.append({
            "id": i,
            "mine_name": mine,
            "district": district,
            "latitude": lat,
            "longitude": lon,
            "alert_type": alert_type,
            "risk_level": risk_level,
            "confidence": confidence,
            "temperature_c": temperature,
            "dust_index": dust_index,
            "vibration_level": vibration,
            "rainfall_mm": rainfall,
            "timestamp": timestamp,
            "message": message
        })
    return alerts

if __name__ == "__main__":
    data = generate_alerts()
    with open("../data/mine_alerts_telangana_openpit.json", "w") as f:
        json.dump(data, f, indent=2)
    print("✅ mine_alerts_telangana_openpit.json updated with fresh alerts!")
