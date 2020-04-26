/**
 *  Arduino code for an Iot project that sends 
 * ambiant temperature and humidity readings
 * to the firebase firestore.
 * The project connects to the database using 
 * firebase cloud functions.
 * 
 * Find the code on github: https://github.com/callezenwaka/ambisense
 * 
 * Send in your feedback or connect on twitter @callezenwaka
 * */
// Import required libraries3
#include <WiFi.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

HTTPClient http;

// Define constant parameters
#define DEVICE_ID WiFi.macAddress() // Device mac address and will be used to save data in the database
#define DHTPIN 2                    // Digital pin connected to the DHT sensor
#define DELAY 1000                  // Delay interval between call to the server
#define DHTTYPE DHT11               // DHT 11

DHT dht(DHTPIN, DHTTYPE);

// Replace with your network credentials
const char* ssid = "";
const char* password = "";

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200); //send and receive at 115200 baud
  
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED){
    delay(DELAY);
    Serial.print("Connected to this Wifi with IP: ");
    Serial.println(WiFi.localIP());
  }
  dht.begin();
}

// String dataInfo;

void loop() {
  // put your main code here, to run repeatedly:
  if(WiFi.status() == WL_CONNECTED){
    float h = dht.readHumidity(); // Reads temperature or humidity takes about 250 milliseconds!
    float t = dht.readTemperature();
    if (isnan(h) || isnan(t)) {                                                
      Serial.println("Failed to read from DHT sensor!");
      return;
    }                        

    // Start call to backend server with http client
    String url = '' // Assign the url to a variable: optional (or directly as a variable in http.begin())
    HTTPClient http;
    http.begin("url" + DEVICE_ID);
    http.addHeader("Content-Type", "application/json;charset=UTF-8"); // Set headers for transaction
    StaticJsonDocument<200> doc; // Convert data from sensors to json format
    doc["temperature"] = t;
    doc["humidity"] = h;
    // Add an array.
    //
    // JsonArray gps = doc.createNestedArray("gps");
    // gps.add(48.756080);
    // gps.add(2.302038);

    // serialize data to Json: I used a library here (avoid DRY)
    String dataInfo;
    serializeJsonPretty(doc, Serial);
    Serial.println();
    serializeJson(doc, dataInfo); 
                            
    Serial.println();
    int httpCode = http.POST(dataInfo); // Actual post to server

    if(httpCode > 0){
      Serial.println("HTTP Code  " + String(httpCode));   //Print return code

      if(httpCode == 200){
        String httpCode = http.getString();
        Serial.println("The server responded  ");
        Serial.println();
        Serial.println(httpCode);
      }
     }else{
       Serial.print("Error sending POST, code: ");
       Serial.println(httpCode);
     }
    http.end();
    
  }else{
    Serial.println("Check your wifi connection"); // error catch if failure occured
  }
  delay(DELAY); // Delay few interval before sending new data to the server
}

// END OF POST