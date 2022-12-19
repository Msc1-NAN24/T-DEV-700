#ifndef OLED_SCREEN_H
#define OLED_SCREEN_H

#include <Adafruit_SSD1306.h>


class OledScreen {
public:

    /**
     * @brief Construct a new Oled Screen object
     *
     * @param screenWidth The width of the screen
     * @param screenHeight The height of the screen
     * @param oledResetPin The pin used to reset the screen (default: -1)
     */
    OledScreen(int screenWidth, int screenHeight, int oledResetPin = -1);

    /**
     * @brief display welcome screen
     *
     */
    void welcome();

    /**
     * @brief print the total amount on the screen
     *
     * @param amount The total amount to print in centimes
     */
    void printAmount(int amount);

    /**
     * @brief Run the validation animation
     */
    void validateAnimation();

    /**
     * @brief Run error animation
     *
     * @param message Error message
     */
    void errorAnimation(String message);

    /**
     * @brief Run the process animation
     */
    void process();

    /**
     * @brief Clear the screen
     */
    void clear();


    /**
     * @brief messsage for wifi waiting
     *
     */
    void wifiWaiting();


private:

    Adafruit_SSD1306* display;

};


#endif
