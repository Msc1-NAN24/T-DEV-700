#include "Program.h"

#include <Arduino.h>
#include <BankApi.h>


Program::Program() {
    //init obj
    this->bank = new BankApi(IP_SERVER, PORT_SERVER, CLIENT_USER, CLIENT_PASSWORD);

    // init rfid
    this->NFC = new NfcModule(SS_PIN, RST_PIN);

    // init screen
    this->screen = new OledScreen(OLED_WIDTH, OLED_HEIGHT, OLED_RESET);

    // init QRcode
    this->qrCode = new QrCode();

    // Startup
    Serial.begin(MONITOR_SPEED);

    // this->screen->process();
    // this->screen->printAmount(4269);
    // delay(1000);
    // this->screen->validateAnimation();

}

String result = "";

bool temp = false;

void Program::loop() {
    String tag = this->NFC->read();
    if (tag != "") {
        Serial.println(tag);
        delay(1000);
    }


    if (result == "") {
        result = qrCode->read();
    } else if (!temp) {
        temp = true;
        Serial.println(result);
        Serial.println(qrCode->getAmount());
        Serial.println(qrCode->getUuid());
    }
}
