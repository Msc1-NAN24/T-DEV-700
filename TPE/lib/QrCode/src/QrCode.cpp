#include "../include/QrCode.h"

#include <Arduino_JSON.h>


QrCode::QrCode() {
    Serial2.begin(115200);
    this->result = "";
}

String QrCode::read() {
    if (Serial2.available() > 0) {
        String result = "";
        while (Serial2.available() > 0) {
            result += (char)Serial2.read();
        }
        this->result += result;
        return this->result;
    }
    return "";
}//TODO: retourner un bool et faire le traitement de la requet dans une autre fonction

void QrCode::readRequest() {
    Serial2.println("~T.");
    this->result = "";
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
