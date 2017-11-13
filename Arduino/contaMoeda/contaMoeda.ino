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
  Serial.begin(9600);
  pinMode(BRANCO, INPUT_PULLUP);
  pinMode(AZUL, INPUT_PULLUP);
  pinMode(VERDE, INPUT_PULLUP);
  pinMode(LARANJA, INPUT_PULLUP);
  pinMode(VERMELHO, INPUT_PULLUP);
  pinMode(AMARELO, INPUT_PULLUP);
}

void loop() {
  //int estado = digitalRead(13);
  //Serial.println(estado);
  
  

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
  
}



