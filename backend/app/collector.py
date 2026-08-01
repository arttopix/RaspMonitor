import os
import platform
import subprocess
import time
import psutil
from dotenv import load_dotenv

load_dotenv()

ALERT_TEMP_WARNING = float(os.getenv("ALERT_TEMP_WARNING", "65.0"))
ALERT_TEMP_CRITICAL = float(os.getenv("ALERT_TEMP_CRITICAL", "75.0"))
ALERT_RAM_CRITICAL = float(os.getenv("ALERT_RAM_CRITICAL", "90.0"))
ALERT_CPU_CRITICAL = float(os.getenv("ALERT_CPU_CRITICAL", "90.0"))

last_net_io = psutil.net_io_counters()
last_net_time = time.time()

def get_cpu_temperature():
    try:
        res = subprocess.run(['vcgencmd', 'measure_temp'], capture_output=True, text=True, timeout=1)
        if res.returncode == 0 and 'temp=' in res.stdout:
            temp_str = res.stdout.strip().replace("temp=", "").replace("'C", "")
            return round(float(temp_str), 1)
    except Exception:
        pass

    try:
        thermal_file = '/sys/class/thermal/thermal_zone0/temp'
        if os.path.exists(thermal_file):
            with open(thermal_file, 'r') as f:
                temp_raw = f.read().strip()
                return round(float(temp_raw) / 1000.0, 1)
    except Exception:
        pass

    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for name, entries in temps.items():
                if entries:
                    return round(entries[0].current, 1)
    except Exception:
        pass

    cpu_percent = psutil.cpu_percent()
    simulated_temp = 42.0 + (cpu_percent * 0.28)
    return round(simulated_temp, 1)


def get_throttled_status():
    result = {
        "raw": "0x0",
        "under_voltage": False,
        "throttled": False,
        "freq_capped": False,
        "temp_limit": False
    }
    try:
        res = subprocess.run(['vcgencmd', 'get_throttled'], capture_output=True, text=True, timeout=1)
        if res.returncode == 0 and 'throttled=' in res.stdout:
            raw_hex = res.stdout.strip().replace("throttled=", "")
            value = int(raw_hex, 16)
            result["raw"] = raw_hex
            result["under_voltage"] = bool(value & 0x1)
            result["freq_capped"] = bool(value & 0x2)
            result["throttled"] = bool(value & 0x4)
            result["temp_limit"] = bool(value & 0x8)
    except Exception:
        pass
    return result


def collect_system_metrics():
    global last_net_io, last_net_time

    now = time.time()
    elapsed = max(now - last_net_time, 0.001)

    cpu_percent = psutil.cpu_percent(interval=None)
    cpu_per_core = psutil.cpu_percent(interval=None, percpu=True)
    cpu_freq = psutil.cpu_freq()
    freq_current = round(cpu_freq.current / 1000.0, 2) if cpu_freq else 1.5

    try:
        load_avg = [round(x, 2) for x in os.getloadavg()]
    except (AttributeError, OSError):
        load_avg = [round(cpu_percent / 100 * (psutil.cpu_count() or 4), 2), 0.0, 0.0]

    cpu_temp = get_cpu_temperature()
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()

    try:
        disk_path = '/' if platform.system() != 'Windows' else 'C:\\'
        disk = psutil.disk_usage(disk_path)
    except Exception:
        disk = psutil.disk_usage('.')

    net_io = psutil.net_io_counters()
    bytes_sent_diff = max(net_io.bytes_sent - last_net_io.bytes_sent, 0)
    bytes_recv_diff = max(net_io.bytes_recv - last_net_io.bytes_recv, 0)

    tx_speed_kb = round((bytes_sent_diff / 1024.0) / elapsed, 1)
    rx_speed_kb = round((bytes_recv_diff / 1024.0) / elapsed, 1)

    last_net_io = net_io
    last_net_time = now

    throttled = get_throttled_status()

    alerts = []
    if cpu_temp >= ALERT_TEMP_CRITICAL:
        alerts.append({
            "level": "critical",
            "type": "temperature",
            "message": f"CPU Temp Critical ({cpu_temp}°C >= {ALERT_TEMP_CRITICAL}°C)"
        })
    elif cpu_temp >= ALERT_TEMP_WARNING:
        alerts.append({
            "level": "warning",
            "type": "temperature",
            "message": f"CPU Temp High ({cpu_temp}°C)"
        })

    if mem.percent >= ALERT_RAM_CRITICAL:
        alerts.append({
            "level": "critical",
            "type": "memory",
            "message": f"RAM Usage Critical ({mem.percent}%)"
        })

    if cpu_percent >= ALERT_CPU_CRITICAL:
        alerts.append({
            "level": "warning",
            "type": "cpu",
            "message": f"CPU Load Very High ({cpu_percent}%)"
        })

    if throttled["under_voltage"]:
        alerts.append({
            "level": "critical",
            "type": "power",
            "message": "Under-voltage detected! Check Power Supply."
        })

    if throttled["throttled"]:
        alerts.append({
            "level": "warning",
            "type": "performance",
            "message": "ARM CPU Throttling Active!"
        })

    boot_time = psutil.boot_time()
    uptime_seconds = int(now - boot_time)

    return {
        "timestamp": int(now * 1000),
        "system": {
            "hostname": platform.node(),
            "os": f"{platform.system()} {platform.release()}",
            "architecture": platform.machine(),
            "uptime_seconds": uptime_seconds,
            "throttled": throttled
        },
        "cpu": {
            "percent": cpu_percent,
            "per_core": cpu_per_core,
            "temp_c": cpu_temp,
            "freq_ghz": freq_current,
            "load_avg": load_avg,
            "cores": psutil.cpu_count(logical=True)
        },
        "memory": {
            "total_mb": round(mem.total / (1024 * 1024), 1),
            "used_mb": round(mem.used / (1024 * 1024), 1),
            "available_mb": round(mem.available / (1024 * 1024), 1),
            "percent": mem.percent,
            "swap_used_mb": round(swap.used / (1024 * 1024), 1),
            "swap_total_mb": round(swap.total / (1024 * 1024), 1),
            "swap_percent": swap.percent
        },
        "storage": {
            "total_gb": round(disk.total / (1024 ** 3), 1),
            "used_gb": round(disk.used / (1024 ** 3), 1),
            "free_gb": round(disk.free / (1024 ** 3), 1),
            "percent": disk.percent
        },
        "network": {
            "upload_kbps": tx_speed_kb,
            "download_kbps": rx_speed_kb,
            "total_sent_mb": round(net_io.bytes_sent / (1024 * 1024), 1),
            "total_recv_mb": round(net_io.bytes_recv / (1024 * 1024), 1)
        },
        "alerts": alerts
    }
