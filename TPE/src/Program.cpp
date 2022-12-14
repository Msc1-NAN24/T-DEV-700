#include "Program.h"

#include <Arduino.h>
#include <BankApi.h>
#include <WiFiManager.h>


Program::Program() {
    //init obj
    this->bank = new BankApi(IP_SERVER, PORT_SERVER, CLIENT_USER, CLIENT_PASSWORD);

    // init rfid
    this->NFC = new NfcModule(SS_PIN, RST_PIN);

    // init screen
    this->screen = new OledScreen(OLED_WIDTH, OLED_HEIGHT, OLED_RESET);

    // init QRcode
    this->qrCode = new QrCode();

    this->tram = "";

    // Startup
    Serial.begin(MONITOR_SPEED);

    this->screen->wifiWaiting();

    //init WiFi
    WiFi.mode(WIFI_STA);
    WiFiManager wm;
#ifndef DEBUG
    wm.setDebugOutput(false);
#endif
    wm.autoConnect(WIFI_DEFAULT_SSID, WIFI_DEFAULT_PASSWORD);
}

void Program::loop() {
    if (Serial.available() > 0) {
        String sortie = "";
        while (Serial.available() > 0) {
            sortie += (char)Serial.read();
        }
        this->tram = sortie;
    } else if (this->tram != "") {
        int amount = this->tram.toInt();
#ifdef DEBUG
        Serial.println(this->tram);
#endif
        this->screen->printAmount(amount);

        String qrcodeTram = "";
        String nfcTram = "";
        do {
            qrcodeTram = this->qrCode->read();
            nfcTram = this->NFC->read();
        } while (qrcodeTram == "" && nfcTram == "");
#ifdef DEBUG
        Serial.print("qrcodeTram :");
        Serial.println(qrcodeTram);
        Serial.print("nfcTram :");
        Serial.println(nfcTram);
#endif
        this->screen->process();
        if (qrcodeTram != "") {
            if (this->qrCode->getAmount() != amount) {
#ifdef DEBUG
                Serial.print("QRcode Error : ");
                Serial.print(this->qrCode->getAmount());
                Serial.print(" : ");
                Serial.println(amount);
#endif
                this->tram = "";
                Serial.println("{ \"status\":\"NOK\", \"errorType\" : \"QRcode\" }");
                this->screen->errorAnimation("Valeur QR");
                return;
            } else {
                bool transaction = this->bank->receiveFrom(this->qrCode->getUuid(), this->qrCode->getAmount());
                this->screen->process();
                if (!transaction) {
                    Serial.println("{ \"status\":\"NOK\", \"errorType\" : \"Bank\" }");
                    this->screen->errorAnimation(" Transac: \n   Bank   ");
                } else {
                    Serial.println("{\"status\":\"OK\"}");
                    this->screen->validateAnimation();
                }
                this->tram = "";
            }
        } else {
            bool transaction = this->bank->receiveFromNFC(nfcTram, amount);
            this->screen->process();
            if (!transaction) {
                Serial.println("{ \"status\":\"NOK\", \"errorType\" : \"Bank\" }");
                this->screen->errorAnimation(" Transac: \n   Bank   ");
            } else {
                Serial.println("{\"status\":\"OK\"}");
                this->screen->validateAnimation();
            }
            this->tram = "";
        }
    } else {
        this->screen->welcome();
    }
}
