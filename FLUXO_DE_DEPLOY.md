# 🚀 Fluxo de Trabalho e Deploy (Portela Hub)

Este documento descreve o fluxo oficial de repositório, testes e deploy para toda a equipe de desenvolvimento. Por favor, alinhe suas contribuições com as regras abaixo para evitar sobrescrita de código ou quebra do ambiente da VPS.

## 1. Repositório Oficial
Todos os trabalhos devem ser consolidados no repositório GitHub principal:
**[https://github.com/jjamesnt/Portela-Hub](https://github.com/jjamesnt/Portela-Hub)**

Caso você esteja utilizando um fork ou outro repositório remoto localmente, garanta que seus pushes e pull requests tenham como destino as branches corretas deste repositório oficial.

## 2. Ambientes e Branches

Nossa arquitetura de CI/CD (GitHub Actions) foi configurada de forma simplificada através de branches. **O deploy é automatizado!**

| Ambiente | URL | Branch de Destino | Caminho na VPS |
| :--- | :--- | :--- | :--- |
| **Integração (Testes)** | `portela.app/integracao` | `integracao` | `/opt/portela-integracao` |
| **Produção (Oficial)** | `portela.app` | `main` | `/opt/portela-hub-frontend` |

### 🛠️ Regra de Ouro do Deploy
* **Nunca** faça push direto ou envie código não testado para a `main`.
* Todo código novo deve ser enviado primeiro para a branch `integracao`.
* Exemplo de envio para testes:
  ```bash
  git add .
  git commit -m "feat: minha nova funcionalidade"
  git push origin integracao
  ```
* Após o push na `integracao`, o GitHub Actions irá atualizar a VPS em cerca de 30 segundos, e a alteração ficará visível em `portela.app/integracao`.

## 3. Segurança e Variáveis de Ambiente
O Github Actions já está configurado com as chaves SSH e dados da VPS (`VPS_HOST`, `VPS_USERNAME`, `VPS_SSH_KEY`). Não é necessário interagir diretamente via SSH com a VPS para subir atualizações do Frontend.

Apenas se certifique de estar com a branch local atualizada antes de iniciar novas features (`git pull origin integracao`).
