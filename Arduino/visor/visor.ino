#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_GFX.h>

// OLED display TWI address
#define OLED_ADDR   0x3C

Adafruit_SSD1306 display(-1);

//#if (SSD1306_LCDHEIGHT != 64)
//#error("Height incorrect, please fix Adafruit_SSD1306.h!");
//#endif

void setup() {
  // initialize and clear display
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR);
  display.clearDisplay();
  display.setCursor(10,5);
  display.setTextSize(2.5);
  display.setTextColor(WHITE);
 // display.print("R$ 10,45");
  //display.display();

}

void loop() {
  mostraSaldo();
  delay(10000);
  piscaValor("R$ 0,10");
  mostraSaldo();
  delay(10000);
}

void piscaValor(String valor){
  int count = 0;
  while(count <= 2) {
      display.clearDisplay();
      display.setCursor(10,5);
      display.print(valor);
      display.display();
      delay(500);
      display.clearDisplay();
      display.setCursor(10,5);
      display.print("");
      display.display();
      delay(500);
      display.clearDisplay();
      count++;
    }
  }

void mostraSaldo(){
  display.setCursor(10,5);
  display.print("R$ 17,75");
  display.display();
}

