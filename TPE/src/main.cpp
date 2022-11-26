#include "Program.h"


// #include <SPI.h>
// #include <Wire.h>
// #include <Adafruit_GFX.h>
// #include <Adafruit_SSD1306.h>

#include <SPI.h>
#include <MFRC522.h>


//Program* program;

Adafruit_SSD1306* display;


void setup() {
    //program = new Program();
    Serial.begin(115200);

}

void loop() {
    //program->loop();
}



//TODO: faire lib QR code dans branch dedier

    //commande demande QR code
    //Serial2.begin(9600); //(module clablé sur RX2 et TX2)
    //Serial2.println("T.");
    /*
    if (Serial2.available()) {
        Serial.println(Serial2.readString());
        delay(3000);
        Serial2.println("T.");
    }
    */


    //TODO: faire lib ECRAN dans branch dedier

    // display = new Adafruit_SSD1306(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET);
    // if (!display->begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    //     Serial.println(F("SSD1306 allocation failed"));
    //     for (;;); // Don't proceed, loop forever
    // }
    // display->display();
    // delay(2000);
    // display->clearDisplay();

    // display->setTextSize(1);             // Normal 1:1 pixel scale
    // display->setTextColor(WHITE);        // Draw white text
    // display->setCursor(0, 0);             // Start at top-left corner
    // display->println(F("Hello, world!"));
    // display->display();
