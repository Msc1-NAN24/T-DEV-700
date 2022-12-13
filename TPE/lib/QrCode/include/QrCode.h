#ifndef QR_CODE_H
#define QR_CODE_H

#include <Arduino.h>

class QrCode {
public:
    QrCode();

    String read();

    String getUuid();

    int getAmount();

private:
    /**
     * @brief resultat brut de la lecture du qrcode
     *
     */
    String result;

    /**
     * @brief dernière demande de lecture
     *
     */
    long mili;

    /**
     * @brief envoie une tram de lecture au lecteur
     *
     */
    void readRequest();

};

#endif
