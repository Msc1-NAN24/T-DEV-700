#ifndef NFC_MODULE_H
#define NFC_MODULE_H

#include <MFRC522.h>

class NfcModule {
public:

    /**
     * @brief Construct a new Nfc Module object
     *
     * @param ssPin pin for the slave select
     * @param rstPin pin for the reset
     */
    NfcModule(int ssPin, int rstPin);

    /**
     * @brief read the nfc tag
     *
     */
    String read();

private:

    /**
     * @brief
     */
    MFRC522* rfid;

};


#endif
