#ifndef PROGRAM_H
#define PROGRAM_H

#include "Arduino.h"
#include "BankApi.h"

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
};

#endif
