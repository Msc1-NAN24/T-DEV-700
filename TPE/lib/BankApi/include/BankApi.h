#ifndef BANK_API_H
#define BANK_API_H

#include <Arduino.h>
#include <HTTPClient.h>

#include <WiFiClient.h>

class BankApi {
public:


    /**
     * @brief Construct a new HTTPRequester object
     *
     * @param ip adress of the bank server
     * @param port port of the bank server
     */
    BankApi(String ip, int port, String user, String password);

    /**
     * @brief receive value from the consumer account to the connected account
     *
     * @param userID id of the consumer
     * @param amount amount to send
     * @return true if the transaction is a success
     */
    bool receiveFrom(String userID, int amount);

    /**
     * @brief receive value from the card of the consumer account to the connected account
     *
     * @param NFCID id of nfc card
     * @param amount amount to send
     * @return true if the transaction is a success
     */
    bool receiveFromNFC(String NFCID, int amount);

private:

    /**
     * @brief get the jwt token to the server if the user is not connected
     *
     * @return true
     * @return false
     */
    bool login();

    String username;

    String password;

    String token;

    String ip;
    int port;

    HTTPClient* http;
    WiFiClient* client;

};


#endif
