WebSocketsServer webSocket = WebSocketsServer(TCP_PORT);
Preferences preferences;

//look at all in main file
extern int washing_auto;
extern int washing_loop;
extern int washing_timer;
extern int washing_spinner_duration;
extern int washing_spinner_freeze_duration;
extern int drying_duration;
extern int endcounter_water_level;
extern int water_flow_in_duration;
extern int water_flow_out_duration;
extern int water_raw_min;
extern int water_raw_max;

extern int status;

void readConfig() {
  preferences.begin("wash", false);
  washing_auto = preferences.getUInt("0", washing_auto);
  washing_loop = preferences.getUInt("1", washing_loop);
  washing_timer = preferences.getUInt("2", washing_timer);
  washing_spinner_duration = preferences.getUInt("3", washing_spinner_duration);
  washing_spinner_freeze_duration = preferences.getUInt("4", washing_spinner_freeze_duration);
  drying_duration = preferences.getUInt("5", drying_duration);
  endcounter_water_level = preferences.getUInt("6", endcounter_water_level);
  water_flow_in_duration = preferences.getUInt("7", water_flow_in_duration);
  water_flow_out_duration = preferences.getUInt("8", water_flow_out_duration);
  water_raw_min = preferences.getUInt("9", water_raw_min);
  water_raw_max = preferences.getUInt("A", water_raw_max);
  
  preferences.end();
}
void writeConfig() {
  preferences.begin("wash", false);
  preferences.putUInt("0", washing_auto);
  preferences.putUInt("1", washing_loop);
  preferences.putUInt("2", washing_timer);
  preferences.putUInt("3", washing_spinner_duration);
  preferences.putUInt("4", washing_spinner_freeze_duration);
  preferences.putUInt("5", drying_duration);
  preferences.putUInt("6", endcounter_water_level);
  preferences.putUInt("7", water_flow_in_duration);
  preferences.putUInt("8", water_flow_out_duration);

  preferences.putUInt("9", water_raw_min);
  preferences.putUInt("A", water_raw_max);
  preferences.end();
}
String tTimes( long unsigned int secs ) {
  unsigned int  h = secs / 3600;
  unsigned int  rem = secs % 3600;
  unsigned int  m = rem / 60;
  unsigned int  s = rem % 60;
  return ((m < 10) ? "0" : "") + String(m) + ":" + ((s < 10) ? "0" : "") + String(s);
}
String splitString(String data, char separator, int index) {
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i + 1 : i;
    }
  }
  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}

void delaySeconds(int sec) {
  do {
    sec--;
    delay(1000);
    Serial.println(tTimes(sec));
    if (status != RUN)break;
  } while (sec > 0);
}

void serialEvent1() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\n') {
      stringComplete = true;
      return;
    }
    inputString += inChar;
  }
}
int CW() {
  digitalWrite(CW_PIN, ON);
  digitalWrite(CCW_PIN, OFF);
  return DIR_CW;
}
int CCW() {
  digitalWrite(CW_PIN, OFF);
  digitalWrite(CCW_PIN, ON);
  return DIR_CCW;
}
int STOP() {
  digitalWrite(CW_PIN, OFF);
  digitalWrite(CCW_PIN, OFF);
  return DIR_NONE;
}


void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  String sMsg = "";
  switch (type) {
    case WStype_DISCONNECTED:
      // Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
      {
        //IPAddress ip = webSocket.remoteIP(num);
        //Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);

        // send message to client
        //webSocket.sendTXT(num, "Connected");
      }
      break;
    case WStype_TEXT:
      for (int i = 0; i < length; i++)
        sMsg += (char)payload[i];
#if defined(ARDUINO_ESP8266_NODEMCU) || defined(ESP32)
      inputString = sMsg;
      stringComplete = true;
      socketNum = num;

      Serial.println("Socket.receive(" + sMsg + ")");
#else
      Serial.println("Socket.receive(" + sMsg + ")");
#endif
      // send message to client
      // webSocket.sendTXT(num, "message here");

      // send data to all connected clients
      // webSocket.broadcastTXT("message here");
      break;
    case WStype_BIN:;
      //Serial.printf("[%u] get binary length: %u\n", num, length);
      //hexdump(payload, length);

      // send message to client
      // webSocket.sendBIN(num, payload, length);
      break;
  }
}
