#define BRANCO 13
#define AZUL 12
#define VERDE 11
#define LARANJA 10
#define VERMELHO 9
#define AMARELO 8
#define ATIVO 0

int posicao = 0;

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
    posicao = posicao < AMARELO ? AMARELO : posicao;
    Serial.print("Posicao ");
    Serial.println(posicao);
  } else if(digitalRead(VERMELHO) == ATIVO) {
    posicao = posicao < VERMELHO ? VERMELHO : posicao;
    Serial.print("Posicao ");
    Serial.println(posicao);
  }else if(digitalRead(LARANJA) == ATIVO) {
    posicao = posicao < LARANJA ? LARANJA : posicao;
    Serial.print("Posicao ");
    Serial.println(posicao);
  }else if(digitalRead(VERDE) == ATIVO) {
    posicao = posicao < VERDE ? VERDE : posicao;
    Serial.print("Posicao ");
    Serial.println(posicao);
  }else if(digitalRead(AZUL) == ATIVO) {
    posicao = posicao < AZUL ? AZUL : posicao;
    Serial.print("Posicao ");
    Serial.println(posicao);
  }else if(digitalRead(BRANCO) == ATIVO) {
   if(posicao > 0) {
    Serial.print("Valor da Moeda R$ ");
    Serial.println(posicao);
    posicao = 0;
   }
  }

  delay(100);
}
