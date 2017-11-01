//Programa : Modulo bluetooth HC-06 - Configuracao

//Carrega a biblioteca SoftwareSerial
#include <SoftwareSerial.h>

//Define os pinos para a serial  (RX, TX)
SoftwareSerial MinhaSerial(6, 7);
String command = "";
float moeda = 0.5;

void setup()
{
  //Inicia a serial
  Serial.begin(115200);
  Serial.println("Digite os comandos AT :");
  //Inicia a serial configurada nas portas 6 e 7
  MinhaSerial.begin(9600);
}

void loop()
{
  
 /* if (MinhaSerial.available())
  {
    while (MinhaSerial.available())
    {
      command += (char)MinhaSerial.read();
    }
    Serial.println(command);
    command = "";
  }

  if (Serial.available())
  {
    delay(10);
    MinhaSerial.write(Serial.read());
    
  }*/

  MinhaSerial.println(moeda);
  moeda++;
  if(moeda > 99 ){
    moeda = 0.05;
    }
  
  delay(500);
}

