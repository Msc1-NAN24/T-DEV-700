#ifndef QR_CODE_H
#define QR_CODE_H

#include <Arduino.h>

class QrCode {
public:
    QrCode();

    String read();

    void readRequest();

    String getUuid();

    int getAmount();

private:
    String result;

};

#endif
