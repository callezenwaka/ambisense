// test/basic_test/test_main.cpp
#include <Arduino.h>

void setup()
{
  Serial.begin(115200);
  Serial.println("Setup called");
}

void loop()
{
  Serial.println("Loop running");
  delay(1000);
}