# ESP32 Pinout & Connection Guide for BharatOS IoT Module

## Component Mappings

### 1. Actuators (L298N Dual H-Bridge DC Motor Driver)
- **Motor A Speed (PWM)**: GPIO 14 (Channel 0, 5 kHz)
- **Motor A Direction IN1**: GPIO 27
- **Motor A Direction IN2**: GPIO 26
- **Motor B Speed (PWM)**: GPIO 13 (Channel 1, 5 kHz)
- **Motor B Direction IN3**: GPIO 25
- **Motor B Direction IN4**: GPIO 33

### 2. Servo Actuator (SG90 Micro Servo)
- **Signal Pin**: GPIO 18 (PWM 50Hz, 500µs - 2400µs pulse width)
- **Power**: 5V VCC
- **Ground**: Common Ground GND

### 3. Visual Status Indicator
- **Onboard LED**: GPIO 2 (Active HIGH)

### 4. ESP32-CAM Connections (Optional Video Node)
- **Port 80**: HTTP Control / Capture API (`/capture`)
- **Port 81**: MJPEG Video Stream (`/stream`)
- **Flash LED**: GPIO 4

---

## Power Requirements
- **ESP32 Microcontroller**: 5V DC via micro-USB or Vin.
- **L298N Motor Controller**: 7.4V - 12V DC power supply for motors.
- **Common Ground**: Standardize ground connections between ESP32, L298N, and Servo.
