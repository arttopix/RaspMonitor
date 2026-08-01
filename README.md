# 🍓 RaspMonitor - Raspberry Pi 4 Real-Time Telemetry & Monitoring WebApp

**RaspMonitor** เป็น Web Application สไตล์ Futuristic Dark Glassmorphism สำหรับติดตามประสิทธิภาพ สภาวะ และสุขภาพของเครื่อง **Raspberry Pi 4 Model B** แบบ Real-Time 1.0 วินาที

![RaspMonitor System Architecture](https://img.shields.io/badge/Raspberry%20Pi-4B-red?style=for-the-badge&logo=raspberrypi)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ✨ Features (ฟีเจอร์เด่น)

- ⚡ **Real-time Telemetry (1.0s tick)**: Push ข้อมูลสดผ่าน WebSockets
- 🌡️ **CPU & Thermal Monitoring**: ติดตามอุณหภูมิ (°C) ผ่าน `vcgencmd measure_temp`, ความถี่ (GHz), Load Average (1m, 5m, 15m) และ per-core usage
- 🧠 **Memory Breakdown**: สถิติการใช้ LPDDR4 RAM และ Swap memory
- 💾 **Storage Usage**: ตรวจสอบพื้นที่ดิสก์ MicroSD / SSD (Mount `/`)
- 🌐 **Network Bandwidth**: กราฟแสดงความเร็ว Upload / Download (KB/s) สดพร้อมสรุปยอดรวม Rx/Tx
- ⚡ **Raspberry Pi Specific Hardware Alerts**: แจ้งเตือนเมื่อเกิดสถานะ **Under-voltage** (ไฟเลี้ยงไม่พอ) หรือ **ARM Throttling** (ลดความเร็วเพราะความร้อนสูง) จาก `vcgencmd get_throttled`
- 🔒 **Security Layer**: ระบบ Login ป้องกันการเข้าถึงด้วย **JWT Access Token**
- 🔊 **Audio Alarm Synth**: เสียงสัญญาณเตือน Beep Alert เมื่อความร้อนเกิน 75°C หรือ RAM เกิน 90%

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, WebSockets, `psutil`, PyJWT, `python-dotenv`
- **Frontend**: React 18, Vite 8, Tailwind CSS v4, Recharts, Lucide React Icons

---

## 🚀 Installation & Quickstart on Raspberry Pi 4

### 1. Clone Repository & Setup Environment
```bash
git clone https://github.com/arttopix/RaspMonitor.git
cd RaspMonitor

# Create Python Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install Backend Dependencies
pip install -r backend/requirements.txt
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
*(สามารถแก้ไขค่า Username, Password, Secret Key หรือ Alert Thresholds ในไฟล์ `.env` ได้ตามต้องการ)*

### 3. Start Backend Server
```bash
python3 backend/run_server.py
```

### 4. Build & Start Frontend
```bash
cd frontend
npm install
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://<IP_ของ_Raspberry_Pi>:5173` หรือ `http://raspberrypi.local:5173`
*(Default Login: Username `admin` / Password `admin`)*

---

## 📄 License
Distributed under the MIT License.
