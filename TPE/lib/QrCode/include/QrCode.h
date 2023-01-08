#ifndef QR_CODE_H
#define QR_CODE_H

#include <Arduino.h>

class QrCode {
public:

    /**
     *@brief Construct a new Qr Code object
     *
     */
    QrCode();

    /**
     * @brief envoie une demande de lecture au lecteur tout les 10s environ
     *
     * @return String renvoie la donnée brute lue par le capteur
     */
    String read();


    /**
     *@brief Get the Uuid object
     *
     * @return String Uuid of the cheque
     */
    String getUuid();

    /**
     *@brief Get the Amount object
     *
     * @return int Amount in the cheque
     */
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
