# Manual de Fluxo de Trabalho (Frontend)
*Como trabalhamos juntos no mesmo projeto em locais diferentes sem quebrar a produção.*

Este manual define o fluxo oficial de desenvolvimento, testes e publicação do **Portela Hub (Frontend)**. A partir de agora, nossa pasta base é a raiz oficial do `Portela-Hub`.

---

## 1. O Conceito das "Branches" (Ramificações)
Para não misturarmos o que está em teste com o que está oficial, usamos três ramificações no Git:

- **`main`**: É o código intocável da Produção. O que está aqui é o que aparece no link oficial (`portela.app`).
- **`integracao`** (ou `staging`): É o nosso ambiente de Testes. O que está aqui aparece no link de testes (`portela.app/integracao`).
- **O seu Computador (Local)**: É o seu laboratório privado.

---

## 2. A Rotina de Trabalho (O que cada um faz)

### 👨‍💻 Quando você for programar na máquina local:
A rotina no dia a dia é sempre a mesma:

1. **Sempre puxe as novidades antes de começar a codar:**
   Isso evita conflitos de sincronização.
   ```bash
   git checkout integracao
   git pull origin integracao
   ```
2. **Programe, altere, salve.** (Trabalho normal no Cursor/IDE).
3. **Salve e envie para o ambiente de testes:**
   Quando a funcionalidade estiver pronta para nós testarmos, envie para a nuvem de testes:
   ```bash
   git add .
   git commit -m "feat: descreva o que você construiu ou arrumou"
   git push origin integracao
   ```
> **Como sobe para o ambiente de testes?**
> Ao fazer o `git push origin integracao`, a plataforma de hospedagem vai detectar a atualização, baixar o seu código novo e compilar automaticamente na URL `portela.app/integracao`. Leva cerca de 2 minutos.

---

## 3. O Fluxo de Publicação (Aprovação Final)

### 🚀 Chegou a hora de ir para a Produção (`portela.app`)?
Quando nós dois testamos o `portela.app/integracao` e decidimos lançar para o mundo, nós NÃO copiamos arquivos. Nós apenas fundimos (`merge`) o código de testes no código principal. 

**Como fazer o disparo final:**
1. Abra o terminal na pasta raiz e mude para a branch de produção:
   ```bash
   git checkout main
   ```
2. Atualize sua máquina com a versão mais recente da produção:
   ```bash
   git pull origin main
   ```
3. Funda (junte) todas as novidades da integração para dentro da main:
   ```bash
   git merge integracao
   ```
4. E finalmente, dispare para o servidor ao vivo:
   ```bash
   git push origin main
   ```

> **A Mágica da Produção (GitHub Actions)**
> O simples ato de rodar `git push origin main` ativa o nosso `deploy.yml`. Ele se conecta na VPS via SSH, puxa o código da main, constrói a aplicação e reinicia o frontend oficial de forma totalmente invisível para o usuário final!
