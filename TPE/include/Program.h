#ifndef PROGRAM_H
#define PROGRAM_H

#include <Wire.h>
#include <SPI.h>

#include "Arduino.h"
#include "BankApi.h"
#include "OledScreen.h"
#include "NfcModule.h"

class Program {
public:
    /**
     * Program startup
     */
    Program();

    /**
     * Program main loop
     */
    void loop();

private:
    BankApi* bank;
    OledScreen* screen;

    NfcModule* NFC;
};

#endif
