# FitPro — React Native + Firebase

Projeto Expo / React Native inspirado no PDF de referência: identidade escura, amarelo neon, cartões cinza, textos brancos e navegação inferior.

## Incluído
- Login e cadastro com e-mail/senha (Firebase Authentication)
- Recuperação de senha por e-mail
- Login com Google via OAuth ID token + Firebase Credential
- Sessão persistida com AsyncStorage
- Início, Treinos, Progresso e Perfil
- Cloud Firestore: perfil, treinos e progresso por exercício
- Rotas protegidas: área principal só aparece com usuário autenticado

## Instalação
Requer Node.js 20+.

```bash
npm install
npx expo install --fix
```

## Firebase
1. Crie um projeto em https://console.firebase.google.com/
2. Registre um aplicativo Web nas configurações do projeto e copie a configuração.
3. Copie `.env.example` para `.env` e preencha as variáveis `EXPO_PUBLIC_FIREBASE_*`.
4. Em Authentication > Sign-in method, habilite E-mail/senha e Google.
5. Crie o Cloud Firestore.
6. Publique `firestore.rules` nas regras do Firestore.

As variáveis `EXPO_PUBLIC_*` são públicas no app cliente. Nunca coloque chaves privadas, service account ou segredos administrativos nelas.

## Google OAuth
1. Ative o provedor Google no Firebase Authentication.
2. Configure a tela de consentimento e clientes OAuth no Google Cloud Console.
3. Crie os clientes Web, Android e iOS com os identificadores do seu aplicativo.
4. Preencha as variáveis `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` no `.env`.
5. Android exige package name e SHA-1 do certificado de assinatura; iOS exige bundle identifier. Ajuste `com.seuprojeto.fitpro` em `app.json` para identificadores reais.
6. Para testar o login nativo Google, use um development build e siga a configuração atual do Expo/Google. O fluxo depende de credenciais OAuth válidas; não fica funcional só por instalar o pacote.

## Executar
```bash
npx expo start
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

As regras restringem leitura e escrita ao próprio usuário autenticado.

## Navegação
Deslogado: Login → Cadastro / Esqueci a senha.
Logado: Início / Progresso / Treinos / Perfil.
Ao sair, retorna ao Login automaticamente.

## Antes de publicar
Os números e cargas iniciais são dados demonstrativos baseados no PDF, não são dados reais do aluno. O botão de registro de evolução é demonstrativo. Crie formulários reais de carga/séries/repetições, política de privacidade, termos, monitoramento e revise as regras antes de produção.
