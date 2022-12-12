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
    //TODO: mettre un message de bienvenue sur l'écran

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
