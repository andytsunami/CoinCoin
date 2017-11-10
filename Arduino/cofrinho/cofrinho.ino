//Modulo bluetooth HC-06 - Configuracao
//Carrega a biblioteca SoftwareSerial
#include <SoftwareSerial.h>

//Define os pinos para a serial  (RX, TX)
SoftwareSerial MinhaSerial(50, 51);
String command = "";


//Contagem das moedas
#define BRANCO 13
#define AZUL 12
#define VERDE 11
#define LARANJA 10
#define VERMELHO 9
#define AMARELO 8
#define ATIVO 0

int posicao = 0;
float saldo = 0.0;

void setup() {
  //Inicia a serial
  Serial.begin(115200);
  Serial.println("Digite os comandos AT :");
  //Inicia a serial configurada nas portas 6 e 7
  MinhaSerial.begin(9600);
  
  //Portas do sensor
  pinMode(BRANCO, INPUT_PULLUP);
  pinMode(AZUL, INPUT_PULLUP);
  pinMode(VERDE, INPUT_PULLUP);
  pinMode(LARANJA, INPUT_PULLUP);
  pinMode(VERMELHO, INPUT_PULLUP);
  pinMode(AMARELO, INPUT_PULLUP);

  

}

void loop() {
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
      MinhaSerial.println(saldo);
     
    } else if (command == "l") {
       MinhaSerial.println("saldo está zerado e cofre pode ser aberto");
       saldo = 0.0;
    } else {
      Serial.println("Nao entendi...");
      MinhaSerial.println("Naao entendi o comando");
      }
    
    command = "";
  }
if(digitalRead(AMARELO) == ATIVO) {
    guardaValor(AMARELO);
  } else if(digitalRead(VERMELHO) == ATIVO) {
    guardaValor(VERMELHO);
  }else if(digitalRead(LARANJA) == ATIVO) {
    guardaValor(LARANJA);
  }else if(digitalRead(VERDE) == ATIVO) {
    guardaValor(VERDE);
  }else if(digitalRead(AZUL) == ATIVO) {
    guardaValor(AZUL);
  }else if(digitalRead(BRANCO) == ATIVO) {
    confirmaValor();
  }

  delay(100);
  
}

void guardaValor(int valor) {
    posicao = posicao < valor ? valor : posicao;
}

void confirmaValor(){
  if(posicao > 0) {
    pegaValor();
    posicao = 0;
   }
}

void pegaValor(){
  Serial.print("Valor da moeda: R$ ");
  switch(posicao) {
    case AMARELO : Serial.println("0.10");
    saldo += 0.10;
    break;
    case VERMELHO : Serial.println("0.05");
    saldo += 0.05;
    break;
    case LARANJA : Serial.println("0.50");
    saldo += 0.50;
    break;
    case VERDE : Serial.println("0.25");
    saldo += 0.25;
    break;
    case AZUL : Serial.println("1.00");
    saldo ++;
    break;
  }

  Serial.print("Quantidade total: R$" );
  Serial.println(saldo);
  MinhaSerial.write("Seu saldo é de: R$");
  MinhaSerial.println(saldo);
  
}

