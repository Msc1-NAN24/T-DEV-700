#include "../include/OledScreen.h"

#include <Adafruit_SSD1306.h>

#include "../include/Ok.h"
#include "../include/Process.h"
#include "../include/Error.h"

OledScreen::OledScreen(int screenWidth, int screenHeight, int oledResetPin) {
    this->display = new Adafruit_SSD1306(screenWidth, screenHeight, &Wire, oledResetPin);
    if (!display->begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println(F("SSD1306 allocation failed"));
        for (;;); // Don't proceed, loop forever
    }
    this->display->clearDisplay();
}


void OledScreen::welcome() {
    this->display->clearDisplay();
    this->display->setCursor(0, 0);
    this->display->setTextSize(2);
    this->display->setTextColor(WHITE);
    this->display->println(F("\nBienvenue!"));
    this->display->display();
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

void OledScreen::process() {
    for (int i = 0; i < process_allArray_LEN; i++) {
        this->display->clearDisplay();
        this->display->setCursor(0, 0);
        this->display->setTextSize(2);
        this->display->setTextColor(WHITE);
        this->display->println(F(" Patienter"));
        this->display->drawBitmap(16, 16, process_allArray[i], 96, 48, WHITE);
        this->display->display();
        delay(20);  // FIXME: use a timer
    }
}

void OledScreen::validateAnimation() {
    for (int i = 0; i < epd_bitmap_allArray_LEN; i++) {
        this->display->clearDisplay();
        this->display->drawBitmap(32, 0, epd_bitmap_allArray[i], 64, 64, WHITE);
        this->display->display();
        delay(20);  // FIXME: use a timer
    }
    delay(500);
    this->display->clearDisplay();
    this->display->setCursor(0, 0);
    this->display->setTextSize(2);
    this->display->setTextColor(WHITE);
    this->display->println(F("\n Paiement \n    OK"));
    this->display->println();
    this->display->display();
    delay(5000);
}

void OledScreen::errorAnimation(String message) {
    for (int i = 0; i < error_allArray_LEN; i++) {
        this->display->clearDisplay();
        this->display->drawBitmap(32, 7, error_allArray[i], 64, 51, WHITE);
        this->display->display();
        delay(20);  // FIXME: use a timer
    }
    delay(200);
    this->display->clearDisplay();
    this->display->setCursor(0, 0);
    this->display->setTextSize(2);
    this->display->setTextColor(WHITE);
    this->display->println(F("  Error:  \n"));
    this->display->println(message);
    this->display->println();
    this->display->display();
    delay(5000);
}


void OledScreen::wifiWaiting() {
    this->clear();
    this->display->setCursor(0, 0);
    this->display->setTextSize(2);
    this->display->setTextColor(WHITE);
    this->display->println(F("Connection\n"));
    this->display->println(F("  WiFi...\n"));
    this->display->println();
    this->display->display();
}


void OledScreen::clear() {
    this->display->clearDisplay();
}
