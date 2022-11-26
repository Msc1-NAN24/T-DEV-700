#include <Arduino.h>
#include "Program.h"

#include <BankApi.h>


Program::Program() {
    //init obj
    this->bank = new BankApi(IP_SERVER, PORT_SERVER, CLIENT_USER, CLIENT_PASSWORD);

    // Startup
    Serial.begin(MONITOR_SPEED);

}

void Program::loop() {
    // Loop
}
