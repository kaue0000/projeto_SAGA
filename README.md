# Projeto SAGA

-----------------------------------------------------------FERRAMENTAS-------------------------------------------------------------

- **Framework:** AdonisJS
- **Mensageria:** RabbitMQ
- **Banco de Dados:** PostgreSQL (Bancos independentes para cada serviço)
- **Testes de API:** Postman / ThunderClient

------------------------------------------------------------SOBRE------------------------------------------------------------------

Temos três microsservices: Order, Payment e Notification. Como focamos na comunicação, os serviços são bem enxutos, com pouca lógica por traz.

A força de comunicação escolhida foi **por eventos**, ou **coreografia**.

**Descrição do problema**
O problema abordado é o processamento de pedidos e pagamentos. Em sistemas de e-commerce monolíticos, uma falha no processamento de pagamento pode travar toda a aplicação ou deixar o banco de dados em um estado inconsistente. Portanto, escolhemos distribuir esse problema, ao dividir as responsabilidades em serviços diferentes que interagem entre si via mensagens, utilizando o padrão SAGA, garantindo que em caso de erro, ações de compensação sejam executadas automaticamente. O desafio principal é garantir caso o pagamento falhe, o pedido não fique 'preso' em um estado indefinido, mantendo a consistência eventual entre os serviços.

-----------------------------------------------------------FLUXO-------------------------------------------------------------------

1. **Order Service (Producer e Producer):** O fluxo inicia com a criação de um pedido pelo cliente, onde é informado um valor **(amount)** e atribuído o status padrão `"PENDING"`. O pedido é armazenado no banco de dados local e, simultaneamente, o evento `order_created` é publicado na fila do **RabbitMQ**. Após lançar a mensagem, passa a escutar a fila do payment, e atualiza o status de acordo com a mensagem retornada.
2. **Payment Service (Consumer e Producer):** Atuando como consumidor, o serviço de pagamento escuta a fila e processa o evento `order_created`. Após realizar a lógica de pagamento e registrar a transação em seu banco local, o serviço assume o papel de produtor e publica um novo evento: `payment_approved`.
3. **Notification Service (Consumer):** Por fim, o serviço de notificação monitora os eventos de pagamento. Ao consumir o evento `payment_approved`, armazena o conteúdo e o evento correspondente em seu banco de dados PostgreSQL.

DE FORMA MAIS RESUMIDA: 
 Fluxo Principal (Ou "caminho feliz")
 1. **Order Service** publica `order_created`. 
 2. **Payment Service** consome `order_created`, processa e publica `payment_approved`. 
 3. **Order Service** consome `payment_approved`, processa e altera o status de `PENDING` para `APPROVED`.
 4. **Notification Service** consome `payment_approved` e registra o log de sucesso.
 
 Fluxo de Compensação (Ou "caminho triste". Garante que um pedido não fique pendente caso o pagamento falhe): 
 1. **Payment Service** publica `payment_failed` se houver erro na transação. 
 2. **Order Service** consome `payment_failed` e executa a **compensação**, alterando o status do pedido para `CANCELLED`. 
 3. **Notification Service** consome `payment_failed` e armazena o log de erro.

---------------------------------------------------------EXECUÇÃO---------------------------------------------------------------

Passo a passo para execução:
1. Suba a infraestrutura com o comando **docker-compose up -d** (Irá subir os servidores dos três serviços, e o servidor do rabbitMQ).

Precisamos inicializar cada um dos microsservices separadamente (cada um deles), dessa forma:
2. Execute o comando **cd [nome_do_servico]**.
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


