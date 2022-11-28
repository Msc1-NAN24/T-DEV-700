#ifndef PROGRAM_H
#define PROGRAM_H

#include <Wire.h>
#include <SPI.h>

#include "Arduino.h"
#include "BankApi.h"
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

    NfcModule* NFC;
};

#endif
