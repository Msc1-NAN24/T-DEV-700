#include <Arduino.h>
#include "../include/BankApi.h"
#include <Arduino_JSON.h>


BankApi::BankApi(String ip, int port, String user, String password) {
    this->ip = ip;
    this->port = port;
    this->username = user;
    this->password = password;

    this->client = new WiFiClient();
    this->http = new HTTPClient();
    this->token = "";
}

bool BankApi::receiveFrom(String userID, int amount) {//TODO: mettre l'animation de process dans la fonction d'api
    bool sortie = true;
    this->http->begin(*this->client, this->ip, this->port, URL_CHEQUE + userID + URL_PAYMENT);
    this->http->addHeader("Authorization", "Bearer " + this->token);
    this->http->addHeader("Content-Type", "application/json");
    int resp = this->http->POST("{\"amount\": " + String(amount) + "}");
    if (resp == 401) {  // 401 = Unauthorized
        this->login();
        this->receiveFrom(userID, amount);
    } else if (resp != 201) {
        Serial.print("Error while sending money (QR) : ");
        Serial.println(resp);
        Serial.println(this->http->errorToString(resp));
        Serial.println(this->http->getString());
        sortie = false;
    }
    this->http->end();
    return sortie;
}

bool BankApi::receiveFromNFC(String NFCID, int amount) {
    bool sortie = true;
    this->http->begin(*this->client, this->ip, this->port, URL_CARD + NFCID + URL_PAYMENT);
    this->http->addHeader("Authorization", "Bearer " + this->token);
    this->http->addHeader("Content-Type", "application/json");
    int resp = this->http->POST("{\"amount\": " + String(amount) + "}");
    if (resp == 401) {  // 401 = Unauthorized
        this->login();
        this->receiveFromNFC(NFCID, amount);
    } else if (resp != 201) {
        Serial.println("Error while sending money (NFC) : ");
        Serial.println(resp);
        Serial.println(this->http->errorToString(resp));
        Serial.println(this->http->getString());
        sortie = false;
    }
    this->http->end();
    return sortie;
}

bool BankApi::login() {
    bool sortie = true;
    this->http->begin(*this->client, this->ip, this->port, URL_LOGIN);
    this->http->addHeader("Content-Type", "application/json");
    String body = "{\"username\": \"" + this->username + "\", \"password\": \"" + this->password + "\"}";
    this->http->addHeader("Content-Length", String(body.length()));
    int resp = this->http->POST(body);
    if (resp != 200) {
        Serial.println("connection error");
        Serial.println(resp);
        Serial.println(this->http->errorToString(resp));
        Serial.println(this->http->getString());
        sortie = false;
    } else {
        JSONVar json = JSON.parse(this->http->getString());
        String temp = json.stringify(json["data"]["token"]);
        Serial.print(temp);
        this->token = temp.substring(1, temp.length() - 1);
        Serial.println(this->token);
    }
    this->http->end();
    return sortie;
}

    //this->http->begin(*this->client, this->ip, this->port, this->url);
