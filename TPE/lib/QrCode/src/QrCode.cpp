#include "../include/QrCode.h"

#include <Arduino_JSON.h>


QrCode::QrCode() {
    Serial2.begin(115200);
    this->result = "";
    mili = 0;
}

void QrCode::readRequest() {
    String sortie = "";
    do {
        Serial2.println("~T.");
        this->mili = millis();
        delay(700);
        if (Serial2.available() > 0) {
            while (Serial2.available() > 0) {
                sortie += (char)Serial2.read();
            }
        }
    } while (sortie.indexOf("T␆") != -1);
}

String QrCode::read() {
    String sortie = "";
    if ((this->mili + 11000) < millis()) {
        this->readRequest();
    }
    if (Serial2.available() > 0) {
        while (Serial2.available() > 0) {
            sortie += (char)Serial2.read();
        }
        this->result += sortie;
    }
    return sortie;
}

int QrCode::getAmount() {
    int amount = 0;
    if (this->result == "") {
        return amount;
    }
    int index = this->result.indexOf("amount");
    if (index != -1) {
        JSONVar json = JSON.parse(this->result);
        String amountString = json.stringify(json["amount"]);
        amountString = amountString.substring(1, amountString.length() - 1);
        amount = amountString.toInt();
    }
    return amount;
}

String QrCode::getUuid() {
    String uuid = "";
    if (this->result == "") {
        return uuid;
    }
    int index = this->result.indexOf("UUID");
    if (index != -1) {
        JSONVar json = JSON.parse(this->result);
        uuid = json.stringify(json["UUID"]);
        uuid = uuid.substring(1, uuid.length() - 1);
    }
    return uuid;
}
