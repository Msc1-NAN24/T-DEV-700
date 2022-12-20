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
    //wm.setDebugOutput(false); //FIXME : rm commentaire pour prod
    wm.autoConnect(WIFI_DEFAULT_SSID, WIFI_DEFAULT_PASSWORD);
}

void Program::loop() {
/*
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
*/

    // debut code principal

    if (Serial.available() > 0) {
        String sortie = "";
        while (Serial.available() > 0) {
            sortie += (char)Serial.read();
        }
        this->tram = sortie;
    } else if (this->tram != "") {
        int amount = this->tram.toInt();
        Serial.println(this->tram);
        this->screen->printAmount(amount);

        String qrcodeTram = "";
        String nfcTram = "";
        do {
            qrcodeTram = this->qrCode->read();
            nfcTram = this->NFC->read();
        } while (qrcodeTram == "" && nfcTram == "");

        Serial.print("qrcodeTram :");
        Serial.println(qrcodeTram);

        Serial.print("nfcTram :");
        Serial.println(nfcTram);

        this->screen->process();
        if (qrcodeTram != "") {
            if (this->qrCode->getAmount() != amount) {
                Serial.print("QRcode Error : ");
                Serial.print(this->qrCode->getAmount());
                Serial.print(" : ");
                Serial.println(amount);
                this->tram = "";
                this->screen->errorAnimation("Valeur QR");
                return;
            } else {
                bool transaction = this->bank->receiveFrom(this->qrCode->getUuid(), this->qrCode->getAmount());
                this->screen->process();
                if (!transaction) {
                    this->screen->errorAnimation(" Transac: \n   Bank   ");
                    //TODO: mettre ecran d'erreur requete incorrect
                } else {
                    this->screen->validateAnimation();
                }
                this->tram = "";
            }
        } else {
            //TODO: faire process nfc
            bool transaction = this->bank->receiveFromNFC(nfcTram, amount);
            this->screen->process();
            if (!transaction) {
                this->screen->errorAnimation(" Transac: \n   Bank   ");
                //TODO: mettre ecran d'erreur requete incorrect
            } else {
                this->screen->validateAnimation();
            }
            this->tram = "";
        }
    } else {
        this->screen->welcome();
    }

    /*
    algo :
    j'attend un message serie
    je le transforme en int
    je l'affiche a l'écran le montant de la transaction

    je lis le lecteur qrcode et le lecteur nfc
    j'affiche l'ecran de chargement
    si qrcode je compart le montant avec le montant envoyer
        si diff je renvoie une erreur a l'app, j'affiche une erreur sur l'écran et je quite le process
        si non j'envoie la requet au serveur de banque
    si non si nfc j'envoie la requet au serveur avec l'id du nfc

    j'attent une reponse du serveur
    si requete valide j'affiche l'écran validée et je send l'id de transaction a l'app
    si elle est invalide j'affiche un message d'érreur et send erreur a l'app
    */
}


//TODO: faire custom field on config (voir :https://www.youtube.com/watch?v=VnfX9YJbaU8)
