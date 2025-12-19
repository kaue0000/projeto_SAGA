Pequeno resumo do nosso projeto:
Temos três microsservices: Order, Payment e Notification. Como focamos na comunicação, os serviços são bem enxutos, com pouca lógica por traz.

A força de comunicação escolhida foi **por eventos.**

O fluxo é o seguinte: 
* **Começando pelo Order Service (Producer):** O fluxo inicia com a criação de um pedido pelo cliente, onde é informado um valor **(amount)** e atribuído o status padrão `"PENDING"`. O pedido é armazenado no banco de dados local e, simultaneamente, o evento `order_created` é publicado na fila do **RabbitMQ**. Neste contexto, o serviço Order atua como o produtor da mensagem.
* **Payment Service (Consumer & Producer):** Atuando como consumidor, o serviço de pagamento escuta a fila e processa o evento `order_created`. Após realizar a lógica de pagamento e registrar a transação em seu banco local, o serviço assume o papel de produtor e publica um novo evento: `payment_created`.
* **Notification Service (Consumer):** Por fim, o serviço de notificação monitora os eventos de pagamento. Ao consumir o evento `payment_created`, armazena o conteúdo e o evento correspondente em seu banco de dados PostgreSQL.

FERRAMENTAS: 
- **Framework:** AdonisJS
- **Mensageria:** RabbitMQ
- **Banco de Dados:** PostgreSQL (Bancos independentes para cada serviço)
- **Testes de API:** Postman / ThunderClient

Passo a passo:
1. Suba a infraestrutura com o comando **docker-compose up -d** (Irá subir os servidores dos três serviços, e o servidor do rabbitMQ).
Precisamos inicializar cada um dos microsservices separadamente (cada um deles), dessa forma:
2. Execute o comando **cp order_service**/**cp payment_service**/**cp notification_service**.
3. Instale as dependências com **npm i**.
4. Execute o comando **cp .env.example .env** para ter as configurações necessários para se conectar ao banco.
5. Execute o comando **node ace generate:key**. 
6. Prepare o banco de dados com comando **node ace migration:run**
7. Inicie servidor do service com o **npm run dev**.
Em um espaço de testes de requisições, como **Postman, Insomnia, ThunderClient, etc**, use o seguinte corpo de mensagem: 

**ORDER**
**URL: http://localhost:3333/orders**
Body (JSON):
{
	"amount": 100
}

 A partir desse corpo, os eventos serão processados e poderão seguir diferentes rumos considerando as possibilidades de falhas internas (de pagamento, principalmente).# projeto_SAGA

Pequeno resumo do nosso projeto:
Temos três microsservices: Order, Payment e Notification. Como focamos na comunicação, os serviços são bem enxutos, com pouca lógica por traz.

A força de comunicação escolhida foi **por eventos.**

O fluxo é o seguinte: 
**Começando pelo Order Service (Producer):** O fluxo inicia com a criação de um pedido pelo cliente, onde é informado um valor **(amount)** e atribuído o status padrão `"PENDING"`. O pedido é armazenado no banco de dados local e, simultaneamente, o evento `order_created` é publicado na fila do **RabbitMQ**. Neste contexto, o serviço Order atua como o produtor da mensagem.
**Payment Service (Consumer & Producer):** Atuando como consumidor, o serviço de pagamento escuta a fila e processa o evento `order_created`. Após realizar a lógica de pagamento e registrar a transação em seu banco local, o serviço assume o papel de produtor e publica um novo evento: `payment_created`.
**Notification Service (Consumer):** Por fim, o serviço de notificação monitora os eventos de pagamento. Ao consumir o evento `payment_created`, armazena o conteúdo e o evento correspondente em seu banco de dados PostgreSQL.

Como ferramentas, utilizamos: Adonis, RabbitMQ, PostgreSQL, Postman/ThunderClient. 

Passo a passo:
Pequeno resumo do nosso projeto:
Temos três microsservices: Order, Payment e Notification. Como focamos na comunicação, os serviços são bem enxutos, com pouca lógica por traz.

A força de comunicação escolhida foi **por eventos.**

O fluxo é o seguinte: 
**Começando pelo Order Service (Producer):** O fluxo inicia com a criação de um pedido pelo cliente, onde é informado um valor **(amount)** e atribuído o status padrão `"PENDING"`. O pedido é armazenado no banco de dados local e, simultaneamente, o evento `order_created` é publicado na fila do **RabbitMQ**. Neste contexto, o serviço Order atua como o produtor da mensagem.
**Payment Service (Consumer & Producer):** Atuando como consumidor, o serviço de pagamento escuta a fila e processa o evento `order_created`. Após realizar a lógica de pagamento e registrar a transação em seu banco local, o serviço assume o papel de produtor e publica um novo evento: `payment_created`.
**Notification Service (Consumer):** Por fim, o serviço de notificação monitora os eventos de pagamento. Ao consumir o evento `payment_created`, armazena o conteúdo e o evento correspondente em seu banco de dados PostgreSQL.

FERRAMENTAS: 
- **Framework:** AdonisJS
- **Mensageria:** RabbitMQ
- **Banco de Dados:** PostgreSQL (Bancos independentes para cada serviço)
- **Testes de API:** Postman / ThunderClient

Passo a passo:
1. Suba a infraestrutura com o comando **docker-compose up -d** (Irá subir os servidores dos três serviços, e o servidor do rabbitMQ).
Precisamos inicializar cada um dos microsservices separadamente (cada um deles), dessa forma:
2. Execute o comando **cp order_service**/**cp payment_service**/**cp notification_service**.
3. Instale as dependências com **npm i**.
4. Execute o comando **cp .env.example .env** para ter as configurações necessários para se conectar ao banco.
5. Execute o comando **node ace generate:key**. 
6. Prepare o banco de dados com comando **node ace migration:run**
7. Inicie servidor do service com o **npm run dev**.
Em um espaço de testes de requisições, como **Postman, Insomnia, ThunderClient, etc**, use o seguinte corpo de mensagem: 

**ORDER**
**URL: http://localhost:3333/orders**
Body (JSON):
{
	"amount": 100
}

 A partir desse corpo, os eventos serão processados e poderão seguir diferentes rumos considerando as possibilidades de falhas internas (de pagamento, principalmente).
