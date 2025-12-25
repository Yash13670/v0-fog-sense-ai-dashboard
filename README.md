# 🌫️ KohraRakshak – AI-Based Fog Safety System

KohraRakshak is an AI-powered road safety application designed to **prevent fog-related road accidents before they happen**.  
Instead of reacting after an accident, the system focuses on **early detection, risk prediction, and real-time driver guidance**.

---

## 🚨 Problem Statement

During winter, dense fog significantly reduces road visibility, leading to:
- Chain collisions on highways
- Delayed driver reactions
- Panic braking and misjudgment

Most existing solutions:
- Only show weather information
- Rely on human judgment
- React **after** accidents occur

👉 **KohraRakshak addresses this gap by providing proactive, data-driven safety alerts.**

---

## 🛡️ Solution Overview

KohraRakshak is a **dashboard-based automatic safety system** that:
- Measures fog using **visibility data**
- Predicts **accident risk**
- Alerts drivers with **clear, actionable guidance**

⚠️ This is **not a chatbot**  
⚠️ No camera-based detection  
⚠️ No manual user input required  

---

## 🔄 How It Works (End-to-End Flow)

1. **Weather & Visibility Data Collection**
   - Fetches real-time or simulated weather data
   - Uses visibility (in meters) as the primary indicator

2. **Fog Detection**
   - Visibility > 1000 m → No Fog  
   - Visibility 300–1000 m → Medium Fog  
   - Visibility < 300 m → Dense Fog  

3. **Accident Risk Prediction**
   - Combines:
     - Fog level
     - Time of day (Day/Night)
     - Road type (Highway/City)
   - Outputs risk level:
     - LOW / MEDIUM / HIGH

4. **Driver Alert & Guidance**
   - Real-time visual and voice alerts
   - Clear actions like:
     - Reduce speed
     - Maintain distance
     - Drive with caution

---

## ✨ Core Features

- 🌫️ **Real-Time Fog Detection**
- ⚠️ **Explainable Accident Risk Prediction**
- 🚦 **Driver Alerts with Actionable Guidance**
- 🔊 **Voice Alerts for Hands-Free Safety**
- 🗺️ **Optional Fog Zone Visualization (Map View)**

---

## ❌ What This Project Does NOT Do

- ❌ No chatbot or conversational UI  
- ❌ No camera-based fog detection  
- ❌ No heavy machine learning models  
- ❌ No medical, insurance, or post-accident services  

The focus is **prevention, simplicity, and reliability**.

---

## 🧠 Why No Camera?

In dense fog:
- Cameras suffer from blur and low contrast
- Visual systems fail to see beyond a few meters

✔️ Visibility data provides **numerical, reliable measurements**  
✔️ Used in aviation and highway safety systems  

> **KohraRakshak measures fog — it doesn’t try to see through it.**

---

## 🧰 Tech Stack

- **Frontend:** HTML / CSS / JavaScript (Dashboard UI)
- **Backend Logic:** Python-style rule-based logic (Flask or mock APIs)
- **Data Source:** Weather API or simulated visibility data
- **Maps (Optional):** Leaflet / Google Maps API

---

## 🚀 Current Status

🔧 **Under Active Development**

The current version demonstrates:
- Fog detection
- Risk prediction
- Driver alerts

---

## 🔮 Planned Enhancements

- 🗺️ Fog heatmaps & route safety scoring  
- 📊 Historical fog pattern analysis  
- 🔔 Push notifications for high-risk zones  
- 🚨 Emergency contact integration  
- 🌧️ Expansion to rain, snow, and icy road hazards  

---

## 🎯 Key Philosophy

> **Accidents don’t happen because of fog.  
They happen because of late awareness.**

KohraRakshak aims to fix that.

---

## 👨‍💻 Author

**Yash Jaiswal**  
B.Tech CSE | AI & Safety Systems Enthusiast  
Building practical technology for real-world impact.

---

## 📌 Note

This project was built as part of a hackathon / innovation initiative and is intended as a **proof-of-concept prototype** focused on safety, clarity, and feasibility.

---

⭐ If you find this idea impactful, feel free to star the repository!
