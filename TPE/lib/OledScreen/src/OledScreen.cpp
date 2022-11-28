#include "../include/OledScreen.h"

#include <Adafruit_SSD1306.h>

OledScreen::OledScreen(int screenWidth, int screenHeight, int oledResetPin) {
    this->display = new Adafruit_SSD1306(screenWidth, screenHeight, &Wire, oledResetPin);
    if (!display->begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println(F("SSD1306 allocation failed"));
        for (;;); // Don't proceed, loop forever
    }
    this->display->clearDisplay();
}



void OledScreen::printAmount(int amount) {
    this->display->clearDisplay();
    this->display->setCursor(0, 0);
    this->display->setTextSize(2);
    this->display->setTextColor(WHITE);
    this->display->println(F("  Total:  "));
    this->display->println();

    this->display->print(amount / 100);
    this->display->print(F(","));
    int centimes = amount % 100;
    if (centimes < 10) {
        this->display->print(F("0"));
    }
    this->display->println(centimes);
    this->display->print(F("       EUR"));
    this->display->display();
}