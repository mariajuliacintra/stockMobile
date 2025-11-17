
# SprintMobile

Este é o aplicativo mobile de um sistema de controle de estoque desenvolvido durante um sprint.


## Descrição

O projeto consiste em uma aplicação mobile com telas de Login, Cadastro e funcionalidades de controle de estoque. Desenvolvido com React Native e Expo, ele se integra à Sprint API para obter dados e permitir navegação fluida entre as telas.
## Tecnologias Utilizadas
- **React Native** – Framework para construir aplicações mobile nativas usando JavaScript e React.
- **Expo** – Plataforma que facilita o desenvolvimento, teste e deploy de aplicativos React Native.
- **React Navigation** – Biblioteca para gerenciamento de rotas e navegação dentro do aplicativo.
- **Axios** – Cliente HTTP para realizar requisições a APIs.
- **Styled-Components** – Biblioteca para estilização de componentes utilizando tagged template literals.
## Estrutura do projeto

- **assets/** : Imagens, fontes e outros recursos utilizados no aplicativo.
- **src/** : Código-fonte da aplicação (componentes, telas, estilos e lógica de negócio).
- **App.js** : Arquivo principal que inicializa o aplicativo.
- Arquivos de configuração:
  - `.gitignore`
  - `package.json`
  - `app.json (configurações do Expo)`

## Como Executar o Projeto

### Pré-requisitos

- [node.js](https://nodejs.org/) instalado.

### Passos para Instalação

1. **Clonar o Repositório**

   ```bash
   git clone https://github.com/mariajuliacintra/stockMobile.git

   ```

2. **Entre na Pasta**

   ```bash
   cd stockMobile
   ```

3. **Instalar as Dependências**

- Se estiver usando npm, execute:

  ```bash
  npm i
  ```

4. **Iniciar o Servidor de Desenvolvimento**

- Com npm, execute:
  ```bash
  npx expo start
  ```

5. **Rodar o projeto no AndroidStudio**

- Clique 'A'

### Dependências Necessárias

1. **React Native & Expo**

- Certifique-se de ter o Expo instalado:

  ```bash
  npm i expo
  ```

2. **React Navigation**

- Para gerenciar a navegação entre as telas, instale:

  ```bash
  npm i @react-navigation/native
  npm i @react-navigation/native-stack
  npm i react-native-screens react-native-safe-area-context
  ```

3. **Axios**

- Para integrar com a API utilizando Axios, instale:

  ```bash
  npm i axios
  ```

4. **Styled-Components**

- Para estilizar os componentes:

  ```bash
  npm i styled-components
  ```
  
## Como gerar um APK (build para android)

- Instalar o EAS CLI:
```bash
  npm install -g eas-cli
  ```

- Fazer login:
```bash
    eas login
```

- Configurar Projeto:
```bash
    eas build:configure
```

## Gerar APK:
- Gerar build online (Expo gera link):
```bash
    eas build -p android --profile preview
```

- Gerar APK localmente (gera arquivo .apk direto no computador):
```bash
    eas build -p android --profile preview --local
```

## Documentação Completa dos Requisitos Necessários

Os requisitos necessários para funcionamento pleno do projeto estão em outro repositório. Acesse-os [aqui](https://github.com/mariajuliacintra/stockApi).

## Autores

- [@mariafernandacintra](https://github.com/MariaFernandaCintra)

- [@joaovitorqueiroz](https://github.com/Joqueiroz)



