import json
import random
import datetime


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


ALERT_MESSAGES = {
    "Rockfall": "Loose rocks detected near the upper bench. Inspect slope stability immediately.",
    "Slope Failure": "Ground movement detected on the south wall. Evacuate nearby area and assess risk.",
    "Dust Hazard": "High dust levels detected. Reduce vehicle speed and use protective masks.",
    "Heat Stress": "Surface temperature is high. Limit outdoor work and stay hydrated.",
    "Flooding Risk": "Water buildup near pit floor detected. Activate drainage pumps.",
    "Equipment Overload": "Excessive vibration detected in machinery. Stop and inspect equipment."
}



def ai_model_predict(sensor_data):
    """
    Simulates an AI model's hazard prediction based on environmental data.
    Uses simple threshold logic + probabilistic noise for realism.
    """

    temp = sensor_data["temperature_c"]
    dust = sensor_data["dust_index"]
    vib = sensor_data["vibration_level"]
    rain = sensor_data["rainfall_mm"]

    
    if vib > 0.75 or (dust > 160 and temp > 38):
        risk = "High"
    elif vib > 0.5 or dust > 130 or temp > 36 or rain > 30:
        risk = "Medium"
    else:
        risk = "Low"

    if risk == "High":
        alert_type = random.choice(["Rockfall", "Slope Failure", "Equipment Overload"])
    elif risk == "Medium":
        alert_type = random.choice(["Dust Hazard", "Heat Stress"])
    else:
        alert_type = random.choice(["Flooding Risk", "Dust Hazard"])

   
    confidence = 60 + int(
        min(40, (vib * 30) + ((dust - 100) / 2) * 0.2 + ((temp - 30) * 1.2))
    )
    confidence = max(60, min(confidence, 99))  

    message = ALERT_MESSAGES[alert_type]

    return {
        "alert_type": alert_type,
        "risk_level": risk,
        "confidence": confidence,
        "message": message,
    }


def generate_alerts(n=40):
    alerts = []
    for i in range(1, n + 1):
        mine, lat, lon, district = random.choice(MINES)

       
        temperature = round(random.uniform(30, 45), 1)
        dust_index = random.randint(70, 180)
        vibration = round(random.uniform(0.2, 0.9), 2)
        rainfall = random.randint(0, 50)

        sensor_data = {
            "temperature_c": temperature,
            "dust_index": dust_index,
            "vibration_level": vibration,
            "rainfall_mm": rainfall,
        }

        prediction = ai_model_predict(sensor_data)

        timestamp = (
            datetime.datetime.utcnow()
            - datetime.timedelta(minutes=random.randint(0, 120))
        ).isoformat() + "Z"

        alert = {
            "id": i,
            "mine_name": mine,
            "district": district,
            "latitude": lat,
            "longitude": lon,
            **sensor_data,
            **prediction,
            "timestamp": timestamp,
        }

        alerts.append(alert)

    return alerts


# --- Save output JSON file ---
if __name__ == "__main__":
    data = generate_alerts()
    with open("../data/mine_alerts_telangana_openpit.json", "w") as f:
        json.dump(data, f, indent=2)
    print("✅ mine_alerts_telangana_openpit.json updated with AI-predicted alerts!")
