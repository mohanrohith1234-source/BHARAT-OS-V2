/*
 * BharatOS IoT Module - ESP32 NodeMCU Firmware
 * Controls Dual DC Motors (L298N H-Bridge), SG90 Servo Actuator, and Onboard LED.
 * Communicates with FastAPI Gateway over WebSockets.
 *
 * NOTE: Credentials should be configured via WiFiManager or environment defines.
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// ---------- Configuration (Set via build flags or config file) ----------
#ifndef WIFI_SSID
#define WIFI_SSID "YOUR_WIFI_SSID"
#endif

#ifndef WIFI_PASS
#define WIFI_PASS "YOUR_WIFI_PASSWORD"
#endif

#ifndef GATEWAY_HOST
#define GATEWAY_HOST "192.168.1.50"
#endif

#ifndef GATEWAY_PORT
#define GATEWAY_PORT 8000
#endif

#define DEVICE_ID "esp32-node-01"

// ---------- Pin Definitions ----------
#define PIN_LED          2   // Onboard LED

// L298N Motor Driver A Pins
#define PIN_ENA          14  // Speed control (PWM)
#define PIN_IN1          27  // Direction pin 1
#define PIN_IN2          26  // Direction pin 2

// L298N Motor Driver B Pins
#define PIN_ENB          13  // Speed control (PWM)
#define PIN_IN3          25  // Direction pin 1
#define PIN_IN4          33  // Direction pin 2

// Servo Motor Pin
#define PIN_SERVO        18  // SG90 Servo signal pin

// PWM Setup Constants
#define PWM_FREQ         5000
#define PWM_RES          8   // 8-bit resolution (0-255)
#define PWM_CHAN_A       0
#define PWM_CHAN_B       1

// ---------- Global Objects & Variables ----------
WebSocketsClient webSocket;
Servo sg90Servo;

bool ledState = false;
bool emergencyStop = false;

String motorADir = "stop";
int motorASpeed  = 75; // 0-100%

String motorBDir = "stop";
int motorBSpeed  = 75; // 0-100%

int servoAngle   = 90; // 0-180 degrees

unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 3000;

// ---------- Helper Functions ----------
void setMotorA(String dir, int speedPct) {
  motorASpeed = constrain(speedPct, 0, 100);
  int pwmVal = map(motorASpeed, 0, 100, 0, 255);

  if (emergencyStop || dir == "stop") {
    motorADir = "stop";
    digitalWrite(PIN_IN1, LOW);
    digitalWrite(PIN_IN2, LOW);
    ledcWrite(PWM_CHAN_A, 0);
  } else if (dir == "forward") {
    motorADir = "forward";
    digitalWrite(PIN_IN1, HIGH);
    digitalWrite(PIN_IN2, LOW);
    ledcWrite(PWM_CHAN_A, pwmVal);
  } else if (dir == "backward") {
    motorADir = "backward";
    digitalWrite(PIN_IN1, LOW);
    digitalWrite(PIN_IN2, HIGH);
    ledcWrite(PWM_CHAN_A, pwmVal);
  }
}

void setMotorB(String dir, int speedPct) {
  motorBSpeed = constrain(speedPct, 0, 100);
  int pwmVal = map(motorBSpeed, 0, 100, 0, 255);

  if (emergencyStop || dir == "stop") {
    motorBDir = "stop";
    digitalWrite(PIN_IN3, LOW);
    digitalWrite(PIN_IN4, LOW);
    ledcWrite(PWM_CHAN_B, 0);
  } else if (dir == "forward") {
    motorBDir = "forward";
    digitalWrite(PIN_IN3, HIGH);
    digitalWrite(PIN_IN4, LOW);
    ledcWrite(PWM_CHAN_B, pwmVal);
  } else if (dir == "backward") {
    motorBDir = "backward";
    digitalWrite(PIN_IN3, LOW);
    digitalWrite(PIN_IN4, HIGH);
    ledcWrite(PWM_CHAN_B, pwmVal);
  }
}

void setServo(int angle) {
  servoAngle = constrain(angle, 0, 180);
  sg90Servo.write(servoAngle);
}

void triggerEmergencyStop() {
  emergencyStop = true;
  setMotorA("stop", 0);
  setMotorB("stop", 0);
}

void sendStatusUpdate(String msgType = "status") {
  StaticJsonDocument<512> doc;
  doc["type"]           = msgType;
  doc["device"]         = DEVICE_ID;
  doc["connected"]      = true;
  doc["emergency_stop"] = emergencyStop;
  doc["led_on"]         = ledState;
  doc["led_state"]      = ledState ? "ON" : "OFF";
  doc["motor_a_dir"]    = motorADir;
  doc["motor_a_speed"]  = motorASpeed;
  doc["motor_b_dir"]    = motorBDir;
  doc["motor_b_speed"]  = motorBSpeed;
  doc["servo_angle"]    = servoAngle;

  String output;
  serializeJson(doc, output);
  webSocket.sendTXT(output);
}

void handleCommand(StaticJsonDocument<512>& doc) {
  const char* cmd = doc["command"] | "";

  if (strcmp(cmd, "emergency_stop") == 0) {
    triggerEmergencyStop();
  } else if (strcmp(cmd, "stop") == 0) {
    emergencyStop = false;
    setMotorA("stop", 0);
    setMotorB("stop", 0);
  } else if (strcmp(cmd, "turn_on") == 0) {
    ledState = true;
    digitalWrite(PIN_LED, HIGH);
  } else if (strcmp(cmd, "turn_off") == 0) {
    ledState = false;
    digitalWrite(PIN_LED, LOW);
  } else if (strcmp(cmd, "toggle") == 0) {
    ledState = !ledState;
    digitalWrite(PIN_LED, ledState ? HIGH : LOW);
  } else if (strcmp(cmd, "motor_a_forward") == 0) {
    int spd = doc["speed"] | motorASpeed;
    setMotorA("forward", spd);
  } else if (strcmp(cmd, "motor_a_backward") == 0) {
    int spd = doc["speed"] | motorASpeed;
    setMotorA("backward", spd);
  } else if (strcmp(cmd, "motor_a_stop") == 0) {
    setMotorA("stop", 0);
  } else if (strcmp(cmd, "motor_b_forward") == 0) {
    int spd = doc["speed"] | motorBSpeed;
    setMotorB("forward", spd);
  } else if (strcmp(cmd, "motor_b_backward") == 0) {
    int spd = doc["speed"] | motorBSpeed;
    setMotorB("backward", spd);
  } else if (strcmp(cmd, "motor_b_stop") == 0) {
    setMotorB("stop", 0);
  } else if (strcmp(cmd, "set_servo_angle") == 0) {
    int angle = doc["angle"] | servoAngle;
    setServo(angle);
  } else if (strcmp(cmd, "forward") == 0) {
    int spd = doc["speed"] | motorASpeed;
    setMotorA("forward", spd);
    setMotorB("forward", spd);
  } else if (strcmp(cmd, "reverse") == 0 || strcmp(cmd, "backward") == 0) {
    int spd = doc["speed"] | motorASpeed;
    setMotorA("backward", spd);
    setMotorB("backward", spd);
  }

  sendStatusUpdate("status");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      setMotorA("stop", 0);
      setMotorB("stop", 0);
      break;
    case WStype_CONNECTED:
      sendStatusUpdate("status");
      break;
    case WStype_TEXT: {
      StaticJsonDocument<512> doc;
      DeserializationError error = deserializeJson(doc, payload, length);
      if (!error) {
        handleCommand(doc);
      }
      break;
    }
    default:
      break;
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);

  pinMode(PIN_IN1, OUTPUT);
  pinMode(PIN_IN2, OUTPUT);
  pinMode(PIN_IN3, OUTPUT);
  pinMode(PIN_IN4, OUTPUT);

  ledcSetup(PWM_CHAN_A, PWM_FREQ, PWM_RES);
  ledcAttachPin(PIN_ENA, PWM_CHAN_A);
  ledcSetup(PWM_CHAN_B, PWM_FREQ, PWM_RES);
  ledcAttachPin(PIN_ENB, PWM_CHAN_B);

  sg90Servo.attach(PIN_SERVO);
  sg90Servo.write(servoAngle);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  webSocket.begin(GATEWAY_HOST, GATEWAY_PORT, "/ws/esp32");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(2000);
}

void loop() {
  webSocket.loop();

  unsigned long now = millis();
  if (now - lastHeartbeat > HEARTBEAT_INTERVAL) {
    lastHeartbeat = now;
    if (WiFi.status() == WL_CONNECTED) {
      sendStatusUpdate("heartbeat");
    }
  }
}
