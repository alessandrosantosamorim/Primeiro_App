import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from './AuthContext';
import { C } from './theme';
import { Button, Field, Heading, Link, Screen } from './UI';

function Shell({ children, navigation }) {
  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 30
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            style={{ height: 36, justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={26} color={C.white} />
          </TouchableOpacity>

          <View
            style={{
              alignItems: 'center',
              marginTop: 24,
              marginBottom: 34
            }}
          >
            <Ionicons name="barbell" size={30} color={C.yellow} />
            <Text style={{ color: C.white, fontSize: 29, fontWeight: '900' }}>
              Fit<Text style={{ color: C.yellow }}>Pro</Text>
            </Text>
          </View>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ErrorText({ children }) {
  return children ? (
    <Text
      style={{
        color: C.danger,
        marginBottom: 13,
        fontSize: 13
      }}
    >
      {children}
    </Text>
  ) : null;
}

const msg = code => ({
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-not-found': 'Conta não encontrada.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/network-request-failed': 'Verifique sua conexão.'
}[code] || 'Não foi possível concluir. Tente novamente.');

export function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, E] = useState('');
  const [password, P] = useState('');
  const [busy, B] = useState(false);
  const [error, X] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) {
      return X('Preencha e-mail e senha.');
    }

    try {
      B(true);
      X('');
      await login(email, password);
    } catch (e) {
      X(msg(e.code));
    } finally {
      B(false);
    }
  };

  return (
    <Shell navigation={navigation}>
      <Heading
        title="Bem-vindo de volta!"
        subtitle="Entre para continuar sua evolução."
      />

      <ErrorText>{error}</ErrorText>

      <Field
        label="E-mail"
        value={email}
        onChangeText={E}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
      />

      <Field
        label="Senha"
        value={password}
        onChangeText={P}
        placeholder="Digite sua senha"
        secureTextEntry
      />

      <View
        style={{
          alignItems: 'flex-end',
          marginTop: -3,
          marginBottom: 14
        }}
      >
        <Link onPress={() => navigation.navigate('ForgotPassword')}>
          Esqueceu a senha?
        </Link>
      </View>

      <Button
        title="Entrar"
        onPress={submit}
        loading={busy}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 25
        }}
      >
        <Text style={{ color: C.muted, fontSize: 13 }}>
          Ainda não tem uma conta? 
        </Text>

        <Link onPress={() => navigation.navigate('Register')}>
          Cadastre-se
        </Link>
      </View>
    </Shell>
  );
}

export function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [name, N] = useState('');
  const [email, E] = useState('');
  const [password, P] = useState('');
  const [confirm, Q] = useState('');
  const [busy, B] = useState(false);
  const [error, X] = useState('');

  const submit = async () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      return X('Preencha todos os campos.');
    }

    if (password.length < 6) {
      return X('A senha deve ter ao menos 6 caracteres.');
    }

    if (password !== confirm) {
      return X('As senhas não coincidem.');
    }

    try {
      B(true);
      X('');
      await register({ name, email, password });
    } catch (e) {
      X(msg(e.code));
    } finally {
      B(false);
    }
  };

  return (
    <Shell navigation={navigation}>
      <Heading
        title="Crie sua conta"
        subtitle="Dê o primeiro passo para sua melhor versão."
      />

      <ErrorText>{error}</ErrorText>

      <Field
        label="Nome completo"
        value={name}
        onChangeText={N}
        placeholder="Como podemos te chamar?"
        autoCapitalize="words"
      />

      <Field
        label="E-mail"
        value={email}
        onChangeText={E}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
      />

      <Field
        label="Senha"
        value={password}
        onChangeText={P}
        placeholder="Mínimo de 6 caracteres"
        secureTextEntry
      />

      <Field
        label="Confirmar senha"
        value={confirm}
        onChangeText={Q}
        placeholder="Digite novamente"
        secureTextEntry
      />

      <Button
        title="Criar conta"
        onPress={submit}
        loading={busy}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 24
        }}
      >
        <Text style={{ color: C.muted, fontSize: 13 }}>
          Já tem uma conta? 
        </Text>

        <Link onPress={() => navigation.navigate('Login')}>
          Entrar
        </Link>
      </View>
    </Shell>
  );
}

export function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();

  const [email, E] = useState('');
  const [busy, B] = useState(false);
  const [error, X] = useState('');
  const [done, D] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      return X('Informe seu e-mail.');
    }

    try {
      B(true);
      X('');
      await resetPassword(email);
      D(true);
    } catch (e) {
      X(msg(e.code));
    } finally {
      B(false);
    }
  };

  return (
    <Shell navigation={navigation}>
      <Heading
        title="Esqueceu a senha?"
        subtitle="Informe seu e-mail e enviaremos um link para redefinir sua senha."
      />

      <ErrorText>{error}</ErrorText>

      {done && (
        <Text style={{ color: C.green, marginBottom: 15 }}>
          Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.
        </Text>
      )}

      <Field
        label="E-mail"
        value={email}
        onChangeText={E}
        placeholder="seuemail@exemplo.com"
        keyboardType="email-address"
      />

      <Button
        title="Enviar link de recuperação"
        onPress={submit}
        loading={busy}
      />

      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Link onPress={() => navigation.navigate('Login')}>
          Voltar para o login
        </Link>
      </View>
    </Shell>
  );
}
