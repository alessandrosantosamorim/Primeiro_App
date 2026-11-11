# FitPro — React Native puro (JavaScript) + Expo + Firebase

Aplicativo mobile FitPro com interface escura, amarelo neon e navegação inferior. O código do aplicativo fica diretamente em `src/`, sem TypeScript e sem Expo Router.

## Funcionalidades
- Cadastro, login e recuperação de senha com Firebase Authentication.
- Login com Google (opcional; exige configurar os IDs OAuth).
- Sessão persistida no dispositivo com AsyncStorage.
- Telas Início, Treinos, Progresso e Perfil.
- Perfil, treinos e evolução salvos no Cloud Firestore.
- Navegação protegida: a área principal só aparece após autenticação.

## Requisitos
- Node.js 20 ou superior.
- Expo Go compatível com a versão do Expo deste projeto, ou development build.

## Instalação e execução
Na pasta do projeto, execute:

```bash
npm install
npx expo install --fix
npx expo start
```

Para abrir no Android, pressione `a` no terminal do Expo ou execute `npm run android`.

## Firebase
O arquivo `src/firebase.js` já contém a configuração do projeto Firebase que estava no arquivo original. Se quiser usar outro projeto, substitua os valores de `firebaseConfig` pelos dados do aplicativo Web em Firebase Console → Configurações do projeto → Geral.

No Firebase Console:
1. Em Authentication → Sign-in method, habilite E-mail/senha.
2. Se quiser login Google, habilite também Google e configure os clientes OAuth.
3. Crie o Cloud Firestore.
4. Publique as regras do arquivo `firestore.rules`.

### Login com Google (opcional)
Configure estas variáveis `EXPO_PUBLIC_` no arquivo `.env`:

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=seu-client-id-web
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=seu-client-id-android
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=seu-client-id-ios
```

Sem os IDs OAuth, o botão Google ficará indisponível; login por e-mail e senha continua funcionando. Depois de alterar variáveis de ambiente, reinicie o Expo.

As configurações `EXPO_PUBLIC_*` e a chave de API Firebase são incluídas no aplicativo cliente. Não coloque senhas, chaves privadas ou credenciais de service account no app.

## Estrutura do código

```text
App.js                  # Entrada do Expo
src/
  App.js                # Inicialização do aplicativo
  AuthContext.js        # Estado de autenticação
  AuthScreens.js        # Login, cadastro e recuperação
  MainScreens.js        # Início, treinos, progresso e perfil
  RootNavigator.js      # Navegação e rotas protegidas
  UI.js                 # Componentes visuais reutilizáveis
  data.js               # Operações do Firestore
  firebase.js           # Firebase Auth + Firestore
  theme.js              # Cores do aplicativo
```

## Dados no Firestore

```text
users/{uid}
  uid, name, email, photoURL, createdAt, updatedAt

users/{uid}/workouts/{workoutId}
  title, durationMinutes, completed, exercises[], createdAt

users/{uid}/exerciseProgress/{progressId}
  name, group, gain, sets, createdAt
```

Os números e cargas que aparecem inicialmente são demonstrativos. O botão de registrar evolução também é demonstrativo e pode ser substituído por um formulário real.
