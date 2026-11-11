
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from './AuthContext';
import {
    addProgress,
    addWorkout,
    readProfile,
    readProgress,
    readWorkouts,
    writeProfile,
} from './data';
import { C } from './theme';
import { Button, Card, Field, Screen } from './UI';

const demo = [
  {
    name: 'Agachamento livre',
    group: 'Pernas',
    gain: '+10 kg',
    sets: '4×12',
  },
  {
    name: 'Supino reto',
    group: 'Peito',
    gain: '+5 kg',
    sets: '4×10',
  },
  {
    name: 'Desenvolvimento c/ halteres',
    group: 'Ombros',
    gain: '+2 kg',
    sets: '3×12',
  },
  {
    name: 'Puxada alta',
    group: 'Costas',
    gain: '+5 kg',
    sets: '4×12',
  },
  {
    name: 'Rosca direta',
    group: 'Braços',
    gain: '+2 kg',
    sets: '3×15',
  },
];

const H = ({ children, style }) => (
  <Text
    style={[
      {
        color: C.white,
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 12,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

const P = ({ children, style }) => (
  <Text
    style={[
      {
        color: C.muted,
        fontSize: 13,
        lineHeight: 20,
      },
      style,
    ]}
  >
    {children}
  </Text>
);

const R = ({ children, style }) => (
  <View
    style={[
      {
        flexDirection: 'row',
        alignItems: 'center',
      },
      style,
    ]}
  >
    {children}
  </View>
);

// ========================================
// TELA INICIAL
// ========================================

export function HomeScreen() {
  const { user } = useAuth();
  const [recent, S] = useState([]);

  useEffect(() => {
    if (user) {
      readWorkouts(user.uid).then(S).catch(() => {});
    }
  }, [user]);

  const start = async () => {
    try {
      await addWorkout(user.uid, {
        title: 'Push - Peito e Ombro',
        durationMinutes: 60,
        completed: true,
      });

      Alert.alert(
        'Treino registrado',
        'Seu treino foi salvo.'
      );
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível salvar o treino.'
      );
    }
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 25 }}
      >
        <R
          style={{
            justifyContent: 'space-between',
            marginVertical: 12,
          }}
        >
          <Text
            style={{
              color: C.white,
              fontSize: 22,
              fontWeight: '900',
            }}
          >
            FIT<Text style={{ color: C.yellow }}>PRO</Text>
          </Text>

          <Ionicons
            name="notifications-outline"
            size={23}
            color={C.white}
          />
        </R>

        <H
          style={{
            fontSize: 29,
            marginBottom: 4,
          }}
        >
          Olá, {user?.displayName?.split(' ')[0] || 'atleta'}!
        </H>

        <P
          style={{
            fontSize: 16,
            marginBottom: 22,
          }}
        >
          Bora treinar hoje?
        </P>

        <Card style={{ marginBottom: 25 }}>
          <Text
            style={{
              color: C.yellow,
              fontSize: 11,
              fontWeight: '800',
            }}
          >
            TREINO DE HOJE
          </Text>

          <R
            style={{
              justifyContent: 'space-between',
              marginTop: 12,
            }}
          >
            <View>
              <H style={{ marginBottom: 3 }}>Push</H>
              <P>Peito e Ombro</P>
            </View>

            <TouchableOpacity
              onPress={start}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: C.yellow,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name="play"
                color={C.bg}
                size={25}
              />
            </TouchableOpacity>
          </R>
        </Card>

        <H>Seu resumo</H>

        <R style={{ gap: 9, marginBottom: 24 }}>
          {[
            ['flame', '420', 'Calorias'],
            ['time', '1h15', 'Tempo'],
            ['trophy', '12', 'Treinos'],
          ].map(([ic, n, l]) => (
            <Card
              key={l}
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 12,
              }}
            >
              <Ionicons
                name={ic}
                color={C.yellow}
                size={21}
              />

              <Text
                style={{
                  color: C.white,
                  fontSize: 19,
                  fontWeight: '800',
                  marginTop: 8,
                }}
              >
                {n}
              </Text>

              <P>{l}</P>
            </Card>
          ))}
        </R>

        <H>Próximos exercícios</H>

        {[
          'Supino reto',
          'Supino inclinado',
          'Desenvolvimento',
        ].map((n, i) => (
          <Card
            key={n}
            style={{
              marginBottom: 9,
              padding: 13,
            }}
          >
            <R>
              <Text
                style={{
                  color: C.yellow,
                  fontWeight: '800',
                  marginRight: 13,
                }}
              >
                0{i + 1}
              </Text>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: C.white,
                    fontWeight: '700',
                  }}
                >
                  {n}
                </Text>

                <P>
                  {i === 0 ? '4' : '3'} séries • 12 repetições
                </P>
              </View>

              <Ionicons
                name="chevron-forward"
                color={C.muted}
              />
            </R>
          </Card>
        ))}

        {!!recent.length && (
          <P>
            Último registro: {recent[0].title}
          </P>
        )}
      </ScrollView>
    </Screen>
  );
}

// ========================================
// TELA DE TREINOS
// ========================================

export function WorkoutsScreen() {
  const { user } = useAuth();
  const [busy, B] = useState(false);

  const names = [
    'Supino reto',
    'Supino inclinado',
    'Desenvolvimento com halteres',
    'Elevação lateral',
    'Flexão de braço',
  ];

  const start = async () => {
    try {
      B(true);

      await addWorkout(user.uid, {
        title: 'Push - Peito e Ombro',
        durationMinutes: 60,
        completed: true,
        exercises: names,
      });

      Alert.alert(
        'Treino registrado',
        'Seu treino foi salvo no FitPro.'
      );
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível salvar.'
      );
    } finally {
      B(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 25 }}>
        <H
          style={{
            marginTop: 14,
            fontSize: 28,
          }}
        >
          Treino de Hoje
        </H>

        <P>Push • Peito e Ombro • 60 min</P>

        <View style={{ height: 22 }} />

        {names.map((n, i) => (
          <Card
            key={n}
            style={{ marginBottom: 10 }}
          >
            <R>
              <View
                style={{
                  backgroundColor: C.surface2,
                  padding: 12,
                  borderRadius: 10,
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    color: C.yellow,
                    fontWeight: '800',
                  }}
                >
                  0{i + 1}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: C.white,
                    fontWeight: '700',
                  }}
                >
                  {n}
                </Text>

                <P>
                  {i === 0 ? '4' : '3'} séries •{' '}
                  {i > 2 ? '15' : '12'} repetições
                </P>
              </View>

              <Ionicons
                name="ellipse-outline"
                color={C.muted}
              />
            </R>
          </Card>
        ))}

        <Button
          title="Começar treino"
          onPress={start}
          loading={busy}
        />
      </ScrollView>
    </Screen>
  );
}

// ========================================
// TELA DE PROGRESSO
// ========================================

export function ProgressScreen() {
  const { user } = useAuth();
  const [items, I] = useState(demo);

  useEffect(() => {
    if (user) {
      readProgress(user.uid)
        .then(d => {
          if (d.length) I(d);
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 25 }}>
        <H
          style={{
            marginTop: 14,
            fontSize: 28,
          }}
        >
          Progresso
        </H>

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: C.surface,
            borderRadius: 24,
            padding: 4,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: C.yellow,
              borderRadius: 20,
              padding: 12,
            }}
          >
            <Text
              style={{
                color: C.bg,
                textAlign: 'center',
                fontWeight: '800',
              }}
            >
              Exercícios
            </Text>
          </View>

          <Text
            style={{
              flex: 1,
              color: C.muted,
              textAlign: 'center',
              padding: 12,
            }}
          >
            Treinos
          </Text>

          <Text
            style={{
              flex: 1,
              color: C.muted,
              textAlign: 'center',
              padding: 12,
            }}
          >
            Estatísticas
          </Text>
        </View>

        <H>Seus exercícios</H>

        <P style={{ marginBottom: 18 }}>
          Acompanhe sua evolução em cada exercício.
        </P>

        {items.map((it, i) => (
          <Card
            key={it.id || it.name}
            style={{
              marginBottom: 10,
              padding: 14,
            }}
          >
            <R>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: C.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 13,
                }}
              >
                <Text
                  style={{
                    color: C.yellow,
                    fontWeight: '800',
                  }}
                >
                  0{i + 1}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: C.white,
                    fontWeight: '800',
                    fontSize: 14,
                  }}
                >
                  {it.name}
                </Text>

                <P>{it.group}</P>

                <Text
                  style={{
                    color: C.yellow,
                    fontWeight: '700',
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  ↗ {it.gain} • {it.sets}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                color={C.muted}
              />
            </R>
          </Card>
        ))}

        <Button
          title="Registrar evolução demonstrativa"
          secondary
          onPress={async () => {
            try {
              await addProgress(user.uid, {
                ...demo[0],
                gain: '+1 kg',
              });

              Alert.alert(
                'Salvo',
                'Registro demonstrativo gravado no Firestore.'
              );
            } catch {
              Alert.alert(
                'Erro',
                'Não foi possível salvar.'
              );
            }
          }}
        />
      </ScrollView>
    </Screen>
  );
}

// ========================================
// TELA DE PERFIL MELHORADA
// ========================================

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const [name, setName] = useState(
    user?.displayName || ''
  );

  const [savedName, setSavedName] = useState(
    user?.displayName || ''
  );

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadProfile() {
      try {
        const [profile, history] = await Promise.all([
          readProfile(user.uid),
          readWorkouts(user.uid),
        ]);

        if (!active) return;

        const profileName =
          profile?.name ||
          user.displayName ||
          '';

        setName(profileName);
        setSavedName(profileName);
        setWorkouts(history || []);
      } catch (error) {
        console.log(
          'Erro ao carregar perfil:',
          error
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user]);

  const initials = (name || 'FitPro')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  const memberSince = user?.metadata?.creationTime
    ? new Date(
        user.metadata.creationTime
      ).toLocaleDateString('pt-BR')
    : 'Não disponível';

  const save = async () => {
    if (!name.trim()) {
      setMessage('Digite seu nome antes de salvar.');
      return;
    }

    if (!user) {
      setMessage('Usuário não autenticado.');
      return;
    }

    try {
      setBusy(true);
      setMessage('');

      const newName = name.trim();

      // Atualiza o nome no Firebase Authentication.
      await updateProfile(user, {
        displayName: newName,
      });

      // Atualiza o nome no perfil já existente do Firestore.
      await writeProfile(user.uid, {
        name: newName,
      });

      setName(newName);
      setSavedName(newName);
      setEditing(false);

      setMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      console.log(
        'Erro ao atualizar perfil:',
        error
      );

      setMessage(
        'Não foi possível atualizar seu perfil.'
      );
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => {
    setName(savedName);
    setEditing(false);
    setMessage('');
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza de que deseja sair do FitPro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 35,
        }}
      >
        {/* CABEÇALHO */}

        <R
          style={{
            justifyContent: 'space-between',
            marginTop: 14,
            marginBottom: 22,
          }}
        >
          <View>
            <H
              style={{
                fontSize: 28,
                marginBottom: 3,
              }}
            >
              Meu perfil
            </H>

            <P>
              Gerencie sua conta e informações
            </P>
          </View>

          <Ionicons
            name="person-circle-outline"
            size={34}
            color={C.yellow}
          />
        </R>

        {/* CARTÃO DO USUÁRIO */}

        <Card
          style={{
            alignItems: 'center',
            paddingVertical: 26,
            marginBottom: 22,
            borderWidth: 1,
            borderColor: C.line,
          }}
        >
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: C.yellow,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: C.bg,
                fontSize: 30,
                fontWeight: '900',
              }}
            >
              {initials}
            </Text>
          </View>

          <Text
            style={{
              color: C.white,
              fontSize: 21,
              fontWeight: '900',
            }}
          >
            {name || 'Aluno FitPro'}
          </Text>

          <Text
            style={{
              color: C.muted,
              fontSize: 13,
              marginTop: 6,
            }}
          >
            {user?.email || 'E-mail não disponível'}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: C.surface2,
              paddingHorizontal: 13,
              paddingVertical: 7,
              borderRadius: 20,
              marginTop: 15,
            }}
          >
            <Ionicons
              name="checkmark-circle"
              color={C.yellow}
              size={15}
            />

            <Text
              style={{
                color: C.yellow,
                fontSize: 11,
                fontWeight: '800',
                marginLeft: 6,
              }}
            >
              CONTA ATIVA
            </Text>
          </View>
        </Card>

        {/* RESUMO DA CONTA */}

        <H style={{ fontSize: 19 }}>
          Resumo da conta
        </H>

        <R
          style={{
            gap: 10,
            marginBottom: 24,
          }}
        >
          <Card style={{ flex: 1 }}>
            <Ionicons
              name="barbell-outline"
              color={C.yellow}
              size={23}
            />

            <Text
              style={{
                color: C.white,
                fontSize: 24,
                fontWeight: '900',
                marginTop: 10,
              }}
            >
              {loading ? '...' : workouts.length}
            </Text>

            <P>Registros recentes</P>

            <P style={{ fontSize: 10 }}>
              Últimos 10 registros
            </P>
          </Card>

          <Card style={{ flex: 1 }}>
            <Ionicons
              name="calendar-outline"
              color={C.yellow}
              size={23}
            />

            <Text
              style={{
                color: C.white,
                fontSize: 17,
                fontWeight: '900',
                marginTop: 10,
              }}
            >
              {memberSince}
            </Text>

            <P>Membro desde</P>
          </Card>
        </R>

        {/* DADOS PESSOAIS */}

        <R
          style={{
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <H
            style={{
              fontSize: 19,
              marginBottom: 0,
            }}
          >
            Dados pessoais
          </H>

          {!editing && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setEditing(true);
                setMessage('');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="create-outline"
                color={C.yellow}
                size={18}
              />

              <Text
                style={{
                  color: C.yellow,
                  fontWeight: '800',
                  marginLeft: 5,
                }}
              >
                Editar
              </Text>
            </TouchableOpacity>
          )}
        </R>

        {editing ? (
          <>
            <Field
              label="Nome completo"
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
              autoCapitalize="words"
            />

            <Button
              title="Salvar alterações"
              onPress={save}
              loading={busy}
              disabled={busy}
            />

            <Button
              title="Cancelar"
              secondary
              onPress={cancelEdit}
              disabled={busy}
            />
          </>
        ) : (
          <Card style={{ marginBottom: 18 }}>
            <P>Nome completo</P>

            <Text
              style={{
                color: C.white,
                fontSize: 15,
                fontWeight: '700',
                marginTop: 5,
                marginBottom: 17,
              }}
            >
              {name || 'Não informado'}
            </Text>

            <P>E-mail da conta</P>

            <Text
              style={{
                color: C.white,
                fontSize: 14,
                fontWeight: '600',
                marginTop: 5,
              }}
            >
              {user?.email || 'Não informado'}
            </Text>
          </Card>
        )}

        {!!message && (
          <Text
            style={{
              color: message.includes('sucesso')
                ? C.yellow
                : '#FF7777',
              fontSize: 13,
              textAlign: 'center',
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            {message}
          </Text>
        )}

        {/* CONTA E SEGURANÇA */}

        <H
          style={{
            fontSize: 19,
            marginTop: 25,
          }}
        >
          Conta e segurança
        </H>

        <Card style={{ marginBottom: 12 }}>
          <R
            style={{
              justifyContent: 'space-between',
            }}
          >
            <R>
              <Ionicons
                name="shield-checkmark-outline"
                color={C.yellow}
                size={22}
              />

              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{
                    color: C.white,
                    fontWeight: '700',
                  }}
                >
                  Autenticação
                </Text>

                <P>
                  Conta protegida pelo Firebase
                </P>
              </View>
            </R>

            <Ionicons
              name="checkmark-circle"
              color={C.yellow}
              size={20}
            />
          </R>
        </Card>

        {/* SAIR DA CONTA */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={confirmLogout}
          style={{
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: '#633333',
            borderRadius: 16,
            padding: 17,
            marginTop: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name="log-out-outline"
            color="#FF7777"
            size={21}
          />

          <Text
            style={{
              color: '#FF7777',
              fontSize: 14,
              fontWeight: '800',
              marginLeft: 9,
            }}
          >
            Sair da conta
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            color: C.muted,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 22,
          }}
        >
          FITPRO • Sua evolução começa aqui
        </Text>
      </ScrollView>
    </Screen>
  );
}
