#define uS_TO_S_FACTOR 1000000  //Conversion factor for micro seconds to seconds
#define TIME_TO_SLEEP  5        //Time ESP32 will go to sleep (in seconds)
RTC_DATA_ATTR int bootCount = 0;

#define DIR_NONE 0
#define DIR_CW 1
#define DIR_CCW 2
#define DIR_LOOP 3

#define WTR_HOLD 0
#define WTR_LOAD 1
#define WTR_DRAIN 2

#define BUSY 1
#define OK 0

//mapped to the output state that would you need it be 
//(for the relay state as active HIG or LOW)
#define ON 0
#define OFF 1

#define IDLE 0
#define ERROR 1
#define RUN 2
#define JOG 3

#define ACTION_STOP 0
#define ACTION_WASHING 1
#define ACTION_DRYING 2
#define ACTION_WATER_FLOW_IN 3
#define ACTION_WATER_FLOW_OUT 4

// HX711 circuit wiring
#define LOADCELL_DOUT_PIN 12
#define LOADCELL_SCK_PIN 13

//ESP32_WASHER GPIO_PIN_MAP
#define SPEAKER_PIN 26
#define CW_PIN 22
#define CCW_PIN 14
#define FlOW_IN_PIN 23
#define SPEED_FLOW_OUT_PIN 27
#define START_WASH_PIN 5
#define START_DRY_PIN 4

#define TCP_PORT 1988 //TCP port for WebSocket
#define DEVICE_NAME "WasherESP32" //HostName

bool stringComplete = false;
String inputString = "";
uint8_t socketNum;

//please install the below these library if its not available in this project.
//go to the library manager to install the librarys
#include <ArduinoJson.h> //Version 6.x
#include <Button.h> //excepted this, download from https://github.com/cchian/Button
#include <ESPmDNS.h>
#include <Preferences.h>
#include <PubSubClient.h>
#include <Update.h>
#include <WiFiAP.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <WebServer.h>
#include <WebSocketsServer.h>

#include "HX711.h"
#include "Utils.h"

WebServer webServer(80);

int status = IDLE;
int currentAction = 0;
boolean spinning = false;

Button wash_button(START_WASH_PIN, DIO);
Button dry_button(START_DRY_PIN, DIO);

int current_direction = DIR_NONE;
int previous_direction = DIR_CW;

int washing_time_counter = 0;
int washing_timer_buff;
int wCounter = 0;
int water_level = 0;
long water_raw = 0;
int water_raw_max = 3974012;
int water_raw_min = -123974;
int water_level_min = 0;
int water_level_max = 100;
int endcounter_water_level = 90;
int endcounter_wash_time = 0;
int loaded = 0;
int drained = 0;

int waiting = 0;
int washing_auto = 0;
int start_delay;
int washing_loop = 3;
int washing_timer = 30;
int washing_timers[3] = {
  600,//14mins launder
  600,//8mins clean_1
  600,//8mins clean_2
};

int drying_check_interval = 1000;
int drying_duration  = 15; //7mins
int washing_spinner_duration = 2000; //1.5s per count
int washing_spinner_freeze_duration = 1500;
int water_flow_in_duration = 15; //15s
int water_flow_out_duration = 15; //15s
int flowing_in = water_flow_in_duration;

int sensor_interval = 200; //5Hz for get water level
int auto_interval = 1000; //coutdown to auto start
int run_update_interval = 500;

int totalTime;
int runtime = 0;

unsigned long previousMillis = 0;
unsigned long previousMillisSpin = 0;
unsigned long previousMillisStop = 0;
unsigned long previousMillisSensor = 0;
unsigned long previousMillisAuto = 0;
unsigned long previousMillisRunStatus = 0;
unsigned long previousMillisDry = 0;

int prev_dir = DIR_NONE;
int preDry_count = 0;
int preDrySpin[9] = {2000, 2000, 2000, 2000, 3000, 3000, 3000, 4000, 4000};
int preDryStop[9] = {3000, 3000, 3000, 3000, 2500, 2500, 2500, 2000, 2000};

//WiFi param
const char* ssid = "lloUuou";
const char* password = "34567890";
int wf_connect_timeout = 15;

//device hostname
const char* host = "ESP32_Washer";

//MQTT Param
//const char*   mqtt_server = "llouuou2.ddns.net"; //free mqtt broker
const char*   mqtt_server = "broker.hivemq.com"; //free mqtt broker
const int16_t mqtt_port = 1883;
//const char*   mqtt_username = "cchian";
//const char*   mqtt_password = "1234";
const char*   topics = "nbtc";
const char*   device_id = "CtrC";

DynamicJsonDocument docReq(1024);
WiFiClient wifiClient;
PubSubClient client(wifiClient);
int timer = 0;
HX711 scale;
TaskHandle_t Task1;
TaskHandle_t Task2;
SemaphoreHandle_t xMutex;

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    //if (client.connect(device_id, mqtt_username, mqtt_password)) {
    if (client.connect(device_id)) {
      Serial.println("connected");
      // Subscribe
      client.subscribe(topics);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void callback(char* topic, byte* message, unsigned int length) {
  String messageTemp;
  for (int i = 0; i < length; i++) {
    // Serial.print((char)message[i]);
    messageTemp += (char)message[i];
  }
  //  if (String(topic) == "farm/mushroom/nbtc") {
  deserializeJson(docReq, messageTemp);
  //JsonObject objReq = docReq.as<JsonObject>();
  if (docReq["msg_type"].as<String>().equals("info")) {
    if (!docReq["src"].as<String>().equals(String(device_id))) {
      //request info from android...... and return all info back
      Serial.println("request info from host!");
      DynamicJsonDocument docInfo(1024);
      docInfo["msg_type"] = "info";
      if (status == RUN) {
        //docInfo["status"]["running"] = map(ozone_duration_counter + smale_duration_counter, 0, ozone_duration + smale_duration, 0, 100);
        Serial.println("running");
      } else {
        docInfo["status"] = "idle";
        Serial.println("idle");
      }
      //      docInfo["src"] = device_id;
      //      docInfo["des"] = "publish";
      //      docInfo["data"]["ozone"]["durationo"] = ozone_duration - ozone_duration_counter;
      //      docInfo["data"]["smale"]["type"] = 0;
      //      docInfo["data"]["smale"]["duration"] = smale_duration - smale_duration_counter;
      String datas;
      serializeJson/*Pretty*/(docInfo, datas);
      //microgear.chat(ALIAS, "Hello");
      byte* p = (byte*)malloc(datas.length());
      memcpy(p, datas.c_str(), datas.length());
      //String  pubTopic = "farm/mushroom/nbtc";
      client.publish( topics , p, datas.length());
    } else {
      Serial.println("......from my self");
    }
  } else if (docReq["msg_type"].as<String>().equals("commit")) {
    //commit command from android........
  } else if (docReq["msg_type"].as<String>().equals("stop")) {
    //'stop' command from android........
  }
}

// Task1code for mqtt connecttion check
void Task1code( void * pvParameters ) {
  while (true) {
    unsigned long currentMillis = millis();
    //check time to auto start if washing_auto is enable (if washing_auto>0 then check it)
    if (start_delay >= 0 && status == IDLE) {
      if (currentMillis - previousMillisAuto >= auto_interval) {
        previousMillisAuto = currentMillis;
        start_delay--;
        if (start_delay > 0) {
          Serial.println("Start Washing in :" + String(start_delay) + "s");
        }
      }
      if (start_delay == 0) {
        //start washing
        Serial.println("Washing");
        flowing_in = water_flow_in_duration;
        loaded = 0;
        drained = 0;
        runtime = 0;
        endcounter_wash_time = washing_loop * washing_timer;
        waiting = water_flow_in_duration;
        status = RUN;
        currentAction = ACTION_WATER_FLOW_IN;
      }
    }

    //To check if the microgear is still connected
    /*
      if (client.connected()) {
      //Serial.println("connected");
      client.loop();
      } else {
      Serial.println("connection lost, reconnect...");
      if (timer >= 5000) {
        reconnect();
        timer = 0;
      } else timer += 100;
      }*/

    //sensing...and....update_
    if (currentMillis - previousMillisSensor >= sensor_interval) {
      // save the last time you blinked the LED
      previousMillisSensor = currentMillis;
      totalTime = endcounter_wash_time + drying_duration + loaded + drained + flowing_in + water_flow_out_duration;
      String msg = "sts:" + String(status) +
                   ",ac:" + String(currentAction) +
                   ",wtw:" + String(washing_time_counter + 1) +
                   ",wtd:" + String(washing_timer_buff) +
                   ",tT:" + String(waiting) +
                   ",wlvl:" + String(water_level) +
                   ",wraw:" + String(water_raw) +
                   ",spn:" + String(current_direction) +
                   ",inp:" + String(!digitalRead(FlOW_IN_PIN)) +
                   ",outp:" + String(!digitalRead(SPEED_FLOW_OUT_PIN)) +
                   ",run:" + String(runtime) +
                   ",tal:" + String(totalTime) +
                   ",auto:" + String(washing_auto);
      webSocket.broadcastTXT(msg);
      if (status != IDLE)
        Serial.println(msg);

      if (scale.is_ready()) {
        water_raw = scale.read();
        //Serial.print("raw_water_level: ");
        water_level = map(water_raw, water_raw_min, water_raw_max, water_level_min, water_level_max);
        //Serial.println("water level:" + String(water_level) + "%");
      } else {
        //status=ERROR;
        //Serial.println("HX711 not found.");
      }
    }
    delay(1);
  }
}

//Task2code for main
void Task2code( void * pvParameters ) {
  while (true) {
    unsigned long currentMillis = millis();
    if (status == RUN) {
      if (currentMillis - previousMillisRunStatus >= 1000) {
        previousMillisRunStatus = currentMillis;
        runtime++;
        if (washing_timer_buff > 0)washing_timer_buff--;
        if (currentAction == ACTION_WATER_FLOW_IN)loaded++;
        if (currentAction == ACTION_WATER_FLOW_OUT)drained++;
      }

      switch (currentAction) {
        case ACTION_WATER_FLOW_IN:
          //Serial.println("Run>Take Water In:");
          if (water_level > endcounter_water_level) {
            digitalWrite(FlOW_IN_PIN, OFF);
          } else {

            //Serial.println("Water Level:" + String(water_level));
            digitalWrite(FlOW_IN_PIN, ON);
            waiting = water_flow_in_duration;
          }

          if (waiting > 0) {
            if (currentMillis - previousMillis >= 1000) {
              previousMillis = currentMillis;
              waiting--;
            }
          }
          if (waiting == 0) {
            currentAction = ACTION_WASHING;
            washing_timer_buff = washing_timer;
          }

          break;
        case ACTION_WASHING:
          if (washing_timer_buff > 0) {
            if (currentMillis - previousMillis >= 1000) {
              previousMillis = currentMillis;
            }
          }
          if (spinning > 0) {
            if (currentMillis - previousMillisSpin >= washing_spinner_duration) {
              spinning = STOP();
              previous_direction = current_direction;
              current_direction = DIR_NONE;
              previousMillisStop = currentMillis;
            }
          } else {
            switch (current_direction) {
              case DIR_CW:
              case DIR_CCW:
                if (current_direction == DIR_CW) {
                  spinning = CW();
                } else {
                  spinning = CCW();
                }
                previousMillisSpin = currentMillis;
                break;

              case DIR_NONE:
                if (currentMillis - previousMillisStop >= washing_spinner_freeze_duration) {
                  if (previous_direction == DIR_CW) {
                    current_direction = DIR_CCW;
                  } else {
                    current_direction = DIR_CW;
                  }
                }

                if (washing_timer_buff == 0) {
                  wCounter++;
                  STOP();
                  currentAction = ACTION_WATER_FLOW_OUT;
                }
                break;
            }
          }

          break;
        case ACTION_WATER_FLOW_OUT:
          if (water_level > water_level_min) {
            digitalWrite(SPEED_FLOW_OUT_PIN, ON);
            waiting = water_flow_out_duration;
          }

          if (waiting > 0) {
            if (currentMillis - previousMillis >= 1000) {
              previousMillis = currentMillis;
              waiting--;
            }
          }

          if (waiting == 0) {
            if (washing_time_counter + 1 >= washing_loop) {
              currentAction = ACTION_DRYING;
              digitalWrite(SPEED_FLOW_OUT_PIN, ON);
              preDry_count = 0;
              washing_timer_buff = drying_duration;
              delay(500);
            } else {
              digitalWrite(SPEED_FLOW_OUT_PIN, OFF);
              wCounter = 0;
              currentAction = ACTION_WATER_FLOW_IN;
              washing_time_counter++;
            }
          }

          break;
        case ACTION_DRYING:
          if (currentMillis - previousMillisDry >= drying_check_interval) {
            previousMillisDry = currentMillis;
            if (preDry_count < sizeof(preDrySpin) / sizeof(preDrySpin[0])) {
              if (prev_dir == DIR_NONE) {
                current_direction = CW();
                prev_dir = current_direction;
                drying_check_interval = preDrySpin[preDry_count];
              } else {
                current_direction = STOP();
                prev_dir = current_direction;
                drying_check_interval = preDryStop[preDry_count];
                preDry_count++;
              }
            } else {
              current_direction = CW();
              drying_check_interval = drying_check_interval;
            }
          }
          if (washing_timer_buff == 0) {
            current_direction = STOP();
            currentAction = ACTION_STOP;
            waiting = 5;

          }
          break;
        case ACTION_STOP:
          current_direction = STOP();
          if (waiting > 0) {
            if (currentMillis - previousMillis >= 1000) {
              previousMillis = currentMillis;
              waiting--;
            }
          }
          if (waiting == 0) {
            webSocket.broadcastTXT("success");
            //digitalWrite(SPEED_FLOW_OUT_PIN, OFF);
            status = IDLE;
            Serial.println("success");
          }
          break;
      }
    } else if (status == IDLE) {

      currentAction = 0;
      washing_time_counter = 0;
      digitalWrite(FlOW_IN_PIN, OFF);
      digitalWrite(SPEED_FLOW_OUT_PIN, OFF);
      delay(1);
    } else if (status == JOG) {

      delay(1);
    }
    delay(1);
  }
}

void press(int sender) {
  //Serial.println("Press pin " + String(sender));
}
void release(int sender) {
  //Serial.println("release pin " + String(sender));
}
void click(int sender) {
  Serial.println("Click pin " + String(sender));
  if (status != RUN) {
    if (sender == START_WASH_PIN) {
      Serial.println("<Run");
      status = RUN;
      currentAction = ACTION_WATER_FLOW_IN;
    } else if (sender == START_DRY_PIN) {
      washing_time_counter = washing_loop;
      status = RUN;

      currentAction = ACTION_WATER_FLOW_OUT;//
    }
  }
}
void doubleClick(int sender) {
  Serial.println("Double Click pin " + String(sender));
}
void hold(int sender) {
  if (status != RUN) {
    if (sender == START_DRY_PIN) {
      washing_time_counter = washing_loop;
      digitalWrite(SPEED_FLOW_OUT_PIN, ON);
      //wait for gear seek.
      status = RUN;
      currentAction = ACTION_DRYING;//
    }
  }
}
void longHold(int sender) {
  if (status == RUN) {
    Serial.println("IDLE");
    status = IDLE;
    water_level = 0;
  }
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  readConfig();
  start_delay = washing_auto;

  pinMode(CW_PIN, OUTPUT);
  pinMode(CCW_PIN, OUTPUT);
  pinMode(FlOW_IN_PIN, OUTPUT);
  pinMode(SPEED_FLOW_OUT_PIN, OUTPUT);


  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

  wash_button.eventPress((void*)press);
  wash_button.eventRelease((void*)release);
  wash_button.eventClick((void*)click);
  wash_button.eventDoubleClick((void*)doubleClick);
  wash_button.eventHold((void*)hold);
  wash_button.eventLongHold((void*)longHold);
  /*set time for event with milliseconds
    wash_button.setDoubleClickTime(250);
    wash_button.setHoldTime(2000);
    wash_button.setLongHoldTime(5000);
  */

  dry_button.eventPress((void*)press);
  dry_button.eventRelease((void*)release);
  dry_button.eventClick((void*)click);
  dry_button.eventDoubleClick((void*)doubleClick);
  dry_button.eventHold((void*)hold);
  dry_button.eventLongHold((void*)longHold);
  /*set time for event with milliseconds
    dry_button.setDoubleClickTime(250);
    dry_button.setHoldTime(2000);
    dry_button.setLongHoldTime(5000);
  */

  STOP();
  digitalWrite(FlOW_IN_PIN, OFF);
  digitalWrite(SPEED_FLOW_OUT_PIN, OFF);

  esp_sleep_wakeup_cause_t wakeup_reason;
  wakeup_reason = esp_sleep_get_wakeup_cause();
  if (wakeup_reason == 4) {
    Serial.println("Wakeup caused by touchpad");
    //use AP for offline
    WiFi.softAP(host, "");
    IPAddress myIP = WiFi.softAPIP();
    Serial.print("AP IP address: ");
    Serial.println(myIP);
  } else {
    Serial.println("Wakeup was not caused by deep sleep");
    //use STA for online
    WiFi.mode(WIFI_STA);
    esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
    btStop();
    if (WiFi.begin(ssid, password)) {
      while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        wf_connect_timeout--;
        if (wf_connect_timeout == 0)
          esp_deep_sleep_start();
        Serial.print(".");
      }
    }
  }
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  /*use mdns for host name resolution*/
  if (!MDNS.begin(host)) { //http://esp32.local
    Serial.println("Error setting up MDNS responder!");
    while (1) {
      delay(1000);
    }
  }
  Serial.println("mDNS responder started");

  initHandleds();
  webServer.begin();


  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.print(F("TCP PORT:"));
  Serial.println(String(TCP_PORT));
  /*
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);

    if (client.connect(device_id)) {
      Serial.println("connected");
      client.subscribe(topics);
    }*/

  xMutex = xSemaphoreCreateMutex();
  xTaskCreatePinnedToCore(Task1code, "Task1", 10000, NULL, 1, &Task1, 0); //task  1 on core 0
  xTaskCreatePinnedToCore(Task2code, "Task2", 10000, NULL, 2, &Task2, 1); //task 2 on core 1

}
void loop() {
  webServer.handleClient();
  wash_button.handleButton();
  dry_button.handleButton();
  webSocket.loop();
  // put your main code here, to run repeatedly:

  serialEvent1();
  if (stringComplete == true) {
    //Serial.println(inputString);
    if (inputString.equals("wash")) {
      flowing_in = water_flow_in_duration;
      loaded = 0;
      drained = 0;
      runtime = 0;
      endcounter_wash_time = washing_loop * washing_timer;
      waiting = water_flow_in_duration;
      status = RUN;
      currentAction = ACTION_WATER_FLOW_IN;
    } else if (inputString.equals("dry")) {
      flowing_in = 0;
      drained = 0;
      endcounter_wash_time = 0;
      runtime = 0;
      washing_time_counter = washing_loop;
      waiting = water_flow_out_duration;
      currentAction = ACTION_WATER_FLOW_OUT;//
      status = RUN;
    } else if (inputString.equals("stop")) {
      Serial.println("stopping.....");
      waiting = 10;

      //status = IDLE;
      currentAction = ACTION_STOP;
      //water_level = 0;
      //webSocket.broadcastTXT("Idle");

      //the below code is calibration water_level_sensor
    } else if (inputString.startsWith("emty")) { //tell machine that what is 0% of water level
      //calibate new emty water level
      water_raw_min = water_raw;
    } else if (inputString.startsWith("full")) { //tell machine what is 100% of water level
      //calibate new full water level
      water_raw_max = water_raw;
    } else if (inputString.startsWith("tune")) {//or tell machine what is 100|0% reference by 1000000 raw_measured
      if (water_raw > 1000000) {
        water_raw_max = water_raw;
      } else {
        water_raw_min = water_raw;
      }
      writeConfig();
      // end water_level calibration
    } else if (inputString.startsWith("prm")) {
      washing_loop = splitString(inputString, ',', 1).toInt();
      washing_timer = splitString(inputString, ',', 2).toInt();
      washing_spinner_duration = splitString(inputString, ',', 3).toInt();
      washing_spinner_freeze_duration = splitString(inputString, ',', 4).toInt();
      drying_duration = splitString(inputString, ',', 5).toInt();
      endcounter_water_level = splitString(inputString, ',', 6).toInt();
      water_flow_in_duration = splitString(inputString, ',', 7).toInt();
      water_flow_out_duration = splitString(inputString, ',', 8).toInt();
      washing_auto = splitString(inputString, ',', 9).toInt();
      writeConfig();
    } else if (inputString.startsWith("spin")) {//cw,ccw,loop
      switch (splitString(inputString, '=', 1).toInt()) {
        case DIR_CW:
          washing_timer_buff = 1;
          current_direction = DIR_CW;
          status = RUN;
          break;
        case DIR_CCW:
          washing_timer_buff = 1;
          current_direction = DIR_CCW;
          status = RUN;
          break;
        case DIR_LOOP:

          break;
        case DIR_NONE:
          status = IDLE;
          currentAction = 0;
          break;
      }
    } else if (inputString.startsWith("water")) {//load,drain
      switch (splitString(inputString, '=', 1).toInt()) {
        case WTR_LOAD:
          status = JOG;
          digitalWrite(FlOW_IN_PIN, ON);
          digitalWrite(SPEED_FLOW_OUT_PIN, OFF);
          break;
        case WTR_DRAIN:
          status = JOG;
          digitalWrite(FlOW_IN_PIN, OFF);
          digitalWrite(SPEED_FLOW_OUT_PIN, ON);
          break;
        case WTR_HOLD:
          status = IDLE;
          break;
      }
    }

    stringComplete = false;
    inputString = "";
  }
}
