//Programa : Modulo bluetooth HC-06 - Configuracao

//Carrega a biblioteca SoftwareSerial
#include <SoftwareSerial.h>

//Define os pinos para a serial  (RX, TX)
SoftwareSerial MinhaSerial(50, 51);
String command = "";
float valor = 0.50;
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
  if (MinhaSerial.available())
  {
    while (MinhaSerial.available())
    {
      command += (char)MinhaSerial.read();
    }
    Serial.println(command);
    //MinhaSerial.println("Voce digitou " + command);
    if(command == "s"){
      Serial.println("App tem que receber algo...");
      MinhaSerial.write("Seu saldo é de: R$");
      MinhaSerial.println(valor);
     
    } else if (command == "l") {
       MinhaSerial.println("Valor está zerado e cofre pode ser aberto");
       valor = 0.0;
    } else {
      Serial.println("Nao entendi...");
      MinhaSerial.println("Naao entendi o comando");
      }
    
    command = "";
  }
valor++;
delay(1000);
 /* if (Serial.available())
  {
    delay(500);
    MinhaSerial.write(Serial.read());
    MinhaSerial.println("Faustop");
  }*/
}
