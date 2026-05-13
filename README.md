# 🎟️ API de Rifas

API REST para gerenciamento de rifas, permitindo cadastro de usuários, compra de tickets e sorteio de ganhador.

---

## 🚀 Tecnologias

* Node.js
* Express
* Prisma ORM
* MySQL
* JWT (jsonwebtoken)
* bcrypt
* dotenv

---

## ⚙️ Como rodar o projeto

```bash
# clonar repositório
git clone https://github.com/Rafa-Dev21/api-rifas.git

# entrar na pasta
cd api-rifas

# instalar dependências
npm install

# rodar migrations
npx prisma migrate dev

# iniciar servidor
npm run dev
```

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```
DATABASE_URL="mysql://usuario:senha@localhost:3306/api-rifas"
JWT_SECRET="sua_chave_secreta"
```

---

## 📡 Rotas

### 🔑 Autenticação

* POST `/auth/register` → cadastrar usuário
* POST `/auth/login` → login e retorno do token

---

### 🎟️ Rifas

* POST `/rifas` → criar rifa (🔒 protegido)
* GET `/rifas` → listar rifas
* GET `/rifas/:id` → buscar rifa por ID
* PUT `/rifas/:id` → atualizar rifa (🔒 protegido)
* DELETE `/rifas/:id` → deletar rifa (🔒 protegido)

---

### 💰 Tickets

* POST `/rifas/:id/buy` → comprar número (🔒 protegido)

---

### 🏆 Sorteio

* POST `/rifas/:id/draw` → sortear ganhador

---

## 🔒 Autenticação

As rotas protegidas exigem token JWT no header:

```
Authorization: Bearer SEU_TOKEN
```

---

## 📁 Estrutura do projeto

```
src/
  controllers/
  routes/
  middlewares/
  lib/
prisma/
```

---

## 🧠 Regras de negócio

* Não é possível comprar números já vendidos
* O sorteio só ocorre com participantes
* O ganhador é salvo no banco de dados

---

## 👨‍💻 Autor

Rafael Oliveira
