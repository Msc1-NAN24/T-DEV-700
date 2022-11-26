#ifndef PROGRAM_H
#define PROGRAM_H

#include "Arduino.h"

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
