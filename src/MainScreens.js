
import { useEffect, useState } from 'react';

import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';

import { useAuth } from './AuthContext';

import {
    addProgress,
    addWorkout,
    deleteWorkoutPlan,
    readProfile,
    readProgress,
    readWorkoutPlans,
    readWorkouts,
    writeProfile,
} from './data';

import { C } from './theme';
import { Button, Card, Field, Screen } from './UI';

// ========================================
// DADOS DOS EXERCÍCIOS
// ========================================

export const exercises = [
  { name: 'Supino reto', group: 'Peito', sets: '4x10', description: 'Trabalha a região central do peitoral.' },
  { name: 'Supino inclinado', group: 'Peito', sets: '3x12', description: 'Dá ênfase à parte superior do peitoral.' },
  { name: 'Crucifixo', group: 'Peito', sets: '3x12', description: 'Exercício de isolamento para o peitoral.' },
  { name: 'Flexão de braço', group: 'Peito', sets: '3x15', description: 'Exercício com o peso corporal.' },

  { name: 'Puxada alta', group: 'Costas', sets: '4x12', description: 'Trabalha principalmente os dorsais.' },
  { name: 'Remada curvada', group: 'Costas', sets: '4x10', description: 'Trabalha costas e região posterior.' },
  { name: 'Remada baixa', group: 'Costas', sets: '3x12', description: 'Fortalece a musculatura das costas.' },
  { name: 'Pulldown', group: 'Costas', sets: '3x12', description: 'Exercício para os músculos dorsais.' },

  { name: 'Agachamento livre', group: 'Pernas', sets: '4x12', description: 'Trabalha quadríceps e glúteos.' },
  { name: 'Leg press', group: 'Pernas', sets: '4x12', description: 'Exercício para membros inferiores.' },
  { name: 'Cadeira extensora', group: 'Pernas', sets: '3x15', description: 'Isolamento do quadríceps.' },
  { name: 'Mesa flexora', group: 'Pernas', sets: '3x12', description: 'Trabalha os posteriores da coxa.' },
  { name: 'Panturrilha em pé', group: 'Pernas', sets: '4x15', description: 'Fortalece as panturrilhas.' },

  { name: 'Desenvolvimento', group: 'Ombros', sets: '3x12', description: 'Trabalha os deltoides.' },
  { name: 'Elevação lateral', group: 'Ombros', sets: '3x15', description: 'Dá ênfase à lateral dos ombros.' },
  { name: 'Elevação frontal', group: 'Ombros', sets: '3x12', description: 'Trabalha a parte frontal dos ombros.' },

  { name: 'Rosca direta', group: 'Braços', sets: '3x12', description: 'Exercício para bíceps.' },
  { name: 'Rosca martelo', group: 'Braços', sets: '3x12', description: 'Trabalha bíceps e braquial.' },
  { name: 'Tríceps corda', group: 'Braços', sets: '3x12', description: 'Exercício para tríceps.' },
  { name: 'Tríceps testa', group: 'Braços', sets: '3x10', description: 'Trabalha o tríceps.' },
];

const workoutExercises = [
  'Supino reto',
  'Supino inclinado',
  'Desenvolvimento com halteres',
  'Elevação lateral',
  'Flexão de braço',
];

const workoutList = [
  {
    title: 'Push',
    subtitle: 'Peito, ombros e tríceps',
    duration: '50–60 min',
    exercises: workoutExercises,
  },
  {
    title: 'Pull',
    subtitle: 'Costas e bíceps',
    duration: '45–60 min',
    exercises: [
      'Puxada alta',
      'Remada curvada',
      'Remada baixa',
      'Rosca direta',
      'Rosca martelo',
    ],
  },
  {
    title: 'Legs',
    subtitle: 'Quadríceps, posteriores e panturrilhas',
    duration: '50–70 min',
    exercises: [
      'Agachamento livre',
      'Leg press',
      'Cadeira extensora',
      'Mesa flexora',
      'Panturrilha em pé',
    ],
  },
];

// ========================================
// COMPONENTES AUXILIARES
// ========================================

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

function formatMinutes(minutes) {
  const value = Number(minutes) || 0;

  if (value < 60) return `${value} min`;

  const hours = Math.floor(value / 60);
  const remaining = value % 60;

  return remaining
    ? `${hours}h ${remaining}min`
    : `${hours}h`;
}

function formatDate(date) {
  if (!date) return 'Data não disponível';

  try {
    const value = date.toDate
      ? date.toDate()
      : new Date(date);

    if (Number.isNaN(value.getTime())) {
      return 'Data não disponível';
    }

    return value.toLocaleDateString('pt-BR');
  } catch {
    return 'Data não disponível';
  }
}

function EmptyState({ icon, title, description }) {
  return (
    <Card
      style={{
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 18,
      }}
    >
      <Ionicons name={icon} size={38} color={C.yellow} />

      <Text
        style={{
          color: C.white,
          fontSize: 16,
          fontWeight: '800',
          marginTop: 13,
        }}
      >
        {title}
      </Text>

      <P style={{ textAlign: 'center', marginTop: 7 }}>
        {description}
      </P>
    </Card>
  );
}

// ========================================
// TELA INICIAL
// ========================================

export function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;

    try {
      const [workoutData, progressData] = await Promise.all([
        readWorkouts(user.uid),
        readProgress(user.uid),
      ]);

      setWorkouts(workoutData || []);
      setProgress(progressData || []);
    } catch (error) {
      console.log('Erro ao carregar início:', error);
      Alert.alert('Erro', 'Não foi possível carregar seus dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const completedWorkouts = workouts.filter(
    item => item.completed === true
  );

  const totalMinutes = completedWorkouts.reduce(
    (total, item) => total + (Number(item.durationMinutes) || 0),
    0
  );

  const recent = workouts[0];

  const startWorkout = () => {
    navigation.navigate('WorkoutSession', {
      workout: {
        title: 'Push',
        exercises: workoutExercises,
      },
    });
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <R style={{ justifyContent: 'space-between', marginVertical: 12 }}>
          <Text style={{ color: C.white, fontSize: 23, fontWeight: '900' }}>
            FIT<Text style={{ color: C.yellow }}>PRO</Text>
          </Text>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'FitPro',
                'Você está acompanhando sua evolução. Continue treinando!'
              )
            }
          >
            <Ionicons name="notifications-outline" size={24} color={C.white} />
          </TouchableOpacity>
        </R>

        <H style={{ fontSize: 29, marginBottom: 4 }}>
          Olá, {user?.displayName?.split(' ')[0] || 'atleta'}!
        </H>

        <P style={{ fontSize: 15, marginBottom: 23 }}>
          Bora evoluir hoje?
        </P>

        <Card style={{ marginBottom: 25, borderWidth: 1, borderColor: C.line }}>
          <Text style={{ color: C.yellow, fontSize: 11, fontWeight: '900' }}>
            SEU TREINO
          </Text>

          <R style={{ justifyContent: 'space-between', marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <H style={{ fontSize: 25, marginBottom: 4 }}>Push</H>
              <P>Peito, ombros e tríceps</P>
              <P style={{ marginTop: 5 }}>
                {workoutExercises.length} exercícios
              </P>
            </View>

            <TouchableOpacity
              onPress={startWorkout}
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: C.yellow,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="play" color={C.bg} size={25} />
            </TouchableOpacity>
          </R>
        </Card>

        <H>Seu resumo</H>

        <R style={{ gap: 9, marginBottom: 24 }}>
          {[
            {
              icon: 'barbell-outline',
              number: loading ? '...' : completedWorkouts.length,
              label: 'Treinos',
            },
            {
              icon: 'time-outline',
              number: loading ? '...' : formatMinutes(totalMinutes),
              label: 'Tempo',
            },
            {
              icon: 'trending-up-outline',
              number: loading ? '...' : progress.length,
              label: 'Registros',
            },
          ].map(item => (
            <Card
              key={item.label}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingHorizontal: 5,
                paddingVertical: 15,
              }}
            >
              <Ionicons name={item.icon} color={C.yellow} size={22} />

              <Text
                style={{
                  color: C.white,
                  fontSize: 18,
                  fontWeight: '900',
                  marginTop: 9,
                }}
              >
                {item.number}
              </Text>

              <P>{item.label}</P>
            </Card>
          ))}
        </R>

        <H>Atalhos</H>

        <R style={{ gap: 10, marginBottom: 10 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ExerciseLibrary')}
            style={{ flex: 1 }}
          >
            <Card style={{ alignItems: 'center' }}>
              <Ionicons name="search-outline" color={C.yellow} size={26} />
              <Text style={{ color: C.white, fontWeight: '700', marginTop: 9 }}>
                Exercícios
              </Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WorkoutHistory')}
            style={{ flex: 1 }}
          >
            <Card style={{ alignItems: 'center' }}>
              <Ionicons name="calendar-outline" color={C.yellow} size={26} />
              <Text style={{ color: C.white, fontWeight: '700', marginTop: 9 }}>
                Histórico
              </Text>
            </Card>
          </TouchableOpacity>
        </R>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddProgress')}
        >
          <Card
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 23,
            }}
          >
            <Ionicons name="add-circle-outline" color={C.yellow} size={25} />

            <Text
              style={{
                color: C.white,
                fontWeight: '700',
                marginLeft: 12,
                flex: 1,
              }}
            >
              Registrar minha evolução
            </Text>

            <Ionicons name="chevron-forward" color={C.muted} size={20} />
          </Card>
        </TouchableOpacity>

        <R style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <H style={{ marginBottom: 0 }}>Último treino</H>

          <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory')}>
            <Text style={{ color: C.yellow, fontWeight: '700', fontSize: 12 }}>
              Ver histórico
            </Text>
          </TouchableOpacity>
        </R>

        {recent ? (
          <Card>
            <R>
              <Ionicons name="barbell-outline" color={C.yellow} size={25} />

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: C.white, fontWeight: '800' }}>
                  {recent.title || 'Treino'}
                </Text>

                <P>
                  {formatMinutes(recent.durationMinutes)} •{' '}
                  {recent.completed ? 'Concluído' : 'Não concluído'}
                </P>
              </View>
            </R>
          </Card>
        ) : (
          <EmptyState
            icon="barbell-outline"
            title="Seu primeiro treino começa aqui"
            description="Inicie um treino para começar a construir seu histórico."
          />
        )}
      </ScrollView>
    </Screen>
  );
}

// ========================================
// TELA DE TREINOS
// ========================================

export function WorkoutsScreen({ navigation }) {
  const { user } = useAuth();

  const [customPlans, setCustomPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const loadPlans = async () => {
    if (!user) return;

    try {
      setLoadingPlans(true);

      const data = await readWorkoutPlans(user.uid);
      setCustomPlans(data || []);
    } catch (error) {
      console.log('Erro ao carregar treinos personalizados:', error);

      Alert.alert(
        'Erro',
        'Não foi possível carregar seus treinos personalizados.'
      );
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadPlans();

    const unsubscribe = navigation.addListener('focus', loadPlans);

    return unsubscribe;
  }, [navigation, user]);

  const startWorkout = workout => {
    navigation.navigate('WorkoutSession', { workout });
  };

  const editPlan = plan => {
    navigation.navigate('WorkoutPlanForm', { plan });
  };

  const confirmDelete = plan => {
    Alert.alert(
      'Excluir treino',
      `Deseja excluir "${plan.name}"? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkoutPlan(user.uid, plan.id);

              setCustomPlans(current =>
                current.filter(item => item.id !== plan.id)
              );
            } catch (error) {
              console.log('Erro ao excluir treino:', error);

              Alert.alert(
                'Erro',
                'Não foi possível excluir o treino.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <H style={{ marginTop: 14, fontSize: 28 }}>
          Meus treinos
        </H>

        <P style={{ marginBottom: 18 }}>
          Escolha uma rotina ou monte seu próprio treino.
        </P>

        <Button
          title="Criar treino personalizado"
          onPress={() => navigation.navigate('WorkoutPlanForm')}
        />

        <H style={{ fontSize: 20, marginTop: 15 }}>
          Meus treinos personalizados
        </H>

        {loadingPlans ? (
          <P>Carregando seus treinos...</P>
        ) : customPlans.length === 0 ? (
          <EmptyState
            icon="clipboard-outline"
            title="Nenhum treino personalizado"
            description="Crie seu primeiro treino e ele ficará salvo na sua conta."
          />
        ) : (
          customPlans.map(plan => (
            <Card
              key={plan.id}
              style={{
                marginBottom: 13,
                borderWidth: 1,
                borderColor: C.line,
              }}
            >
              <R style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: C.yellow,
                      fontSize: 10,
                      fontWeight: '900',
                    }}
                  >
                    TREINO PERSONALIZADO
                  </Text>

                  <H style={{ fontSize: 22, marginTop: 7, marginBottom: 4 }}>
                    {plan.name}
                  </H>

                  <P>{plan.exercises?.length || 0} exercícios</P>
                </View>

                <Ionicons name="barbell-outline" color={C.yellow} size={30} />
              </R>

              <View
                style={{
                  height: 1,
                  backgroundColor: C.line,
                  marginVertical: 13,
                }}
              />

              {(plan.exercises || []).slice(0, 4).map((item, index) => (
                <R
                  key={`${item.name}-${index}`}
                  style={{ marginBottom: 8 }}
                >
                  <Text
                    style={{
                      color: C.yellow,
                      fontWeight: '800',
                      width: 25,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Text>

                  <Text style={{ color: C.white, flex: 1, fontSize: 13 }}>
                    {item.name}
                  </Text>

                  <Text style={{ color: C.muted, fontSize: 11 }}>
                    {item.sets}x{item.reps}
                  </Text>
                </R>
              ))}

              {(plan.exercises?.length || 0) > 4 && (
                <P>+ {plan.exercises.length - 4} exercícios</P>
              )}

              <Button
                title="Iniciar treino"
                onPress={() => startWorkout(plan)}
              />

              <R style={{ gap: 9 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Editar"
                    secondary
                    onPress={() => editPlan(plan)}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Button
                    title="Excluir"
                    secondary
                    onPress={() => confirmDelete(plan)}
                  />
                </View>
              </R>
            </Card>
          ))
        )}

        <H style={{ fontSize: 20, marginTop: 20 }}>
          Treinos disponíveis
        </H>

        {workoutList.map((workout, index) => (
          <Card
            key={workout.title}
            style={{
              marginBottom: 14,
              borderWidth: 1,
              borderColor: C.line,
            }}
          >
            <R style={{ justifyContent: 'space-between' }}>
              <View>
                <Text
                  style={{
                    color: C.yellow,
                    fontSize: 11,
                    fontWeight: '900',
                  }}
                >
                  TREINO 0{index + 1}
                </Text>

                <H style={{ fontSize: 25, marginTop: 8, marginBottom: 3 }}>
                  {workout.title}
                </H>

                <P>{workout.subtitle}</P>
              </View>

              <Ionicons name="barbell-outline" color={C.yellow} size={31} />
            </R>

            <View
              style={{
                height: 1,
                backgroundColor: C.line,
                marginVertical: 15,
              }}
            />

            <R style={{ gap: 18, marginBottom: 14 }}>
              <P>{workout.duration}</P>
              <P>{workout.exercises.length} exercícios</P>
            </R>

            {workout.exercises.slice(0, 3).map((name, i) => (
              <R key={name} style={{ marginBottom: 8 }}>
                <Text
                  style={{
                    color: C.yellow,
                    fontWeight: '800',
                    width: 28,
                  }}
                >
                  0{i + 1}
                </Text>

                <Text style={{ color: C.white, fontSize: 13 }}>
                  {name}
                </Text>
              </R>
            ))}

            {workout.exercises.length > 3 && (
              <P style={{ marginTop: 3 }}>
                + {workout.exercises.length - 3} exercícios
              </P>
            )}

            <Button
              title="Iniciar treino"
              onPress={() => startWorkout(workout)}
            />
          </Card>
        ))}

        <Button
          title="Biblioteca de exercícios"
          secondary
          onPress={() => navigation.navigate('ExerciseLibrary')}
        />

        <Button
          title="Ver histórico de treinos"
          secondary
          onPress={() => navigation.navigate('WorkoutHistory')}
        />
      </ScrollView>
    </Screen>
  );
}

// ========================================
// TELA DE EXECUÇÃO DO TREINO
// ========================================

export function WorkoutSessionScreen({ navigation, route }) {
  const { user } = useAuth();

  const workout = route.params?.workout || {
    title: 'Treino personalizado',
    exercises: [],
  };

  const names = (workout.exercises || []).map(item =>
    typeof item === 'string'
      ? {
          name: item,
          sets: 3,
          reps: 12,
          restSeconds: 60,
        }
      : {
          ...item,
          sets: Number(item.sets) || 3,
          reps: Number(item.reps) || 12,
          restSeconds: Number(item.restSeconds) || 0,
        }
  );

  const workoutTitle = workout.title || workout.name || 'Treino';

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [finishedSets, setFinishedSets] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setSeconds(value => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const timer = [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ]
    .map(value => String(value).padStart(2, '0'))
    .join(':');

  const toggleSet = key => {
    setFinishedSets(current =>
      current.includes(key)
        ? current.filter(item => item !== key)
        : [...current, key]
    );
  };

  const finishWorkout = async () => {
    if (!user) return;

    Alert.alert(
      'Finalizar treino',
      'Deseja salvar este treino no seu histórico?',
      [
        {
          text: 'Continuar treinando',
          style: 'cancel',
        },
        {
          text: 'Finalizar',
          onPress: async () => {
            try {
              setBusy(true);
              setRunning(false);

              await addWorkout(user.uid, {
                title: workoutTitle,
                durationMinutes: Math.max(1, Math.round(seconds / 60)),
                completed: true,
                exercises: names,
              });

              Alert.alert(
                'Treino concluído!',
                'Seu treino foi salvo no histórico.',
                [
                  {
                    text: 'Continuar',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.log('Erro ao salvar treino:', error);

              setRunning(true);

              Alert.alert(
                'Erro',
                'Não foi possível salvar seu treino.'
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  const completedCount = finishedSets.length;

  const totalSets = names.reduce(
    (total, item) => total + item.sets,
    0
  );

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <R
          style={{
            justifyContent: 'space-between',
            marginTop: 12,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Sair do treino',
                'Seu treino ainda não foi salvo. Deseja sair?',
                [
                  { text: 'Continuar', style: 'cancel' },
                  {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: () => navigation.goBack(),
                  },
                ]
              )
            }
          >
            <Ionicons name="close" color={C.white} size={28} />
          </TouchableOpacity>

          <Text
            style={{
              color: C.yellow,
              fontWeight: '900',
              fontSize: 12,
            }}
          >
            TREINO EM ANDAMENTO
          </Text>

          <View style={{ width: 28 }} />
        </R>

        <H style={{ fontSize: 28, textAlign: 'center' }}>
          {workoutTitle}
        </H>

        <Card
          style={{
            alignItems: 'center',
            marginBottom: 23,
            paddingVertical: 23,
          }}
        >
          <P>TEMPO DE TREINO</P>

          <Text
            style={{
              color: C.yellow,
              fontSize: 39,
              fontWeight: '900',
              marginVertical: 10,
              fontVariant: ['tabular-nums'],
            }}
          >
            {timer}
          </Text>

          <Button
            title={running ? 'Pausar cronômetro' : 'Continuar cronômetro'}
            secondary
            onPress={() => setRunning(value => !value)}
          />
        </Card>

        <R style={{ justifyContent: 'space-between', marginBottom: 13 }}>
          <H style={{ marginBottom: 0 }}>Exercícios</H>

          <Text style={{ color: C.yellow, fontWeight: '800' }}>
            {completedCount}/{totalSets} séries
          </Text>
        </R>

        {names.length === 0 ? (
          <EmptyState
            icon="barbell-outline"
            title="Nenhum exercício"
            description="Este treino não possui exercícios cadastrados."
          />
        ) : (
          names.map((exercise, index) => (
            <Card
              key={`${exercise.name}-${index}`}
              style={{ marginBottom: 12 }}
            >
              <Text
                style={{
                  color: C.white,
                  fontSize: 15,
                  fontWeight: '800',
                  marginBottom: 5,
                }}
              >
                {index + 1}. {exercise.name}
              </Text>

              <P style={{ marginBottom: 12 }}>
                {exercise.group || 'Exercício'} • Descanso: {exercise.restSeconds}s
              </P>

              {Array.from(
                { length: exercise.sets },
                (_, setIndex) => {
                  const set = setIndex + 1;
                  const key = `${index}-${set}`;
                  const done = finishedSets.includes(key);

                  return (
                    <TouchableOpacity
                      key={key}
                      activeOpacity={0.7}
                      onPress={() => toggleSet(key)}
                      style={{
                        backgroundColor: done ? '#26371E' : C.surface2,
                        borderRadius: 10,
                        padding: 12,
                        marginBottom: 7,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          color: done ? C.green : C.white,
                          fontWeight: '700',
                        }}
                      >
                        Série {set} • {exercise.reps} repetições
                      </Text>

                      <Ionicons
                        name={done ? 'checkmark-circle' : 'ellipse-outline'}
                        color={done ? C.green : C.muted}
                        size={22}
                      />
                    </TouchableOpacity>
                  );
                }
              )}
            </Card>
          ))
        )}

        <Button
          title="Finalizar e salvar treino"
          onPress={finishWorkout}
          loading={busy}
          disabled={busy}
        />
      </ScrollView>
    </Screen>
  );
}

// ========================================
// BIBLIOTECA DE EXERCÍCIOS
// ========================================

export function ExerciseLibraryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const categories = [
    'Todos',
    'Peito',
    'Costas',
    'Pernas',
    'Ombros',
    'Braços',
  ];

  const filtered = exercises.filter(item => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === 'Todos' || item.group === category;

    return matchesSearch && matchesCategory;
  });

  const startExercise = exercise => {
    navigation.navigate('WorkoutSession', {
      workout: {
        title: exercise.name,
        exercises: [exercise.name],
      },
    });
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <R style={{ justifyContent: 'space-between', marginTop: 14 }}>
          <H style={{ fontSize: 27 }}>Biblioteca</H>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" color={C.white} size={26} />
          </TouchableOpacity>
        </R>

        <P style={{ marginBottom: 17 }}>
          Pesquise exercícios por nome ou grupo muscular.
        </P>

        <View
          style={{
            backgroundColor: C.surface,
            borderColor: C.line,
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 14,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 17,
          }}
        >
          <Ionicons name="search-outline" color={C.muted} size={21} />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar exercício..."
            placeholderTextColor={C.muted}
            style={{
              flex: 1,
              color: C.white,
              padding: 14,
              fontSize: 14,
            }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          <R style={{ gap: 8 }}>
            {categories.map(item => {
              const active = category === item;

              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCategory(item)}
                  style={{
                    backgroundColor: active ? C.yellow : C.surface,
                    borderRadius: 20,
                    paddingHorizontal: 15,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      color: active ? C.bg : C.white,
                      fontSize: 12,
                      fontWeight: '800',
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </R>
        </ScrollView>

        <H style={{ fontSize: 18 }}>
          {filtered.length} exercícios encontrados
        </H>

        {filtered.map(item => (
          <Card key={item.name} style={{ marginBottom: 10 }}>
            <R>
              <View
                style={{
                  width: 43,
                  height: 43,
                  borderRadius: 12,
                  backgroundColor: C.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons name="barbell-outline" color={C.yellow} size={23} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: C.white, fontWeight: '800', fontSize: 14 }}>
                  {item.name}
                </Text>

                <P>{item.group} • {item.sets}</P>
              </View>

              <TouchableOpacity
                onPress={() => startExercise(item)}
                style={{
                  backgroundColor: C.yellow,
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <Ionicons name="play" color={C.bg} size={18} />
              </TouchableOpacity>
            </R>

            <P style={{ marginTop: 12 }}>
              {item.description}
            </P>
          </Card>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            icon="search-outline"
            title="Nenhum exercício encontrado"
            description="Tente pesquisar outro nome ou selecionar outro grupo muscular."
          />
        )}
      </ScrollView>
    </Screen>
  );
}

// ========================================
// HISTÓRICO DE TREINOS
// ========================================

export function WorkoutHistoryScreen({ navigation }) {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const data = await readWorkouts(user.uid);
      setItems(data || []);
    } catch (error) {
      console.log('Erro no histórico:', error);

      Alert.alert(
        'Erro',
        'Não foi possível carregar seu histórico.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  const totalMinutes = items
    .filter(item => item.completed)
    .reduce(
      (total, item) => total + (Number(item.durationMinutes) || 0),
      0
    );

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <R
          style={{
            justifyContent: 'space-between',
            marginTop: 14,
            marginBottom: 8,
          }}
        >
          <H style={{ fontSize: 27 }}>Histórico</H>

          <TouchableOpacity onPress={loadHistory}>
            <Ionicons name="refresh-outline" size={23} color={C.yellow} />
          </TouchableOpacity>
        </R>

        <P style={{ marginBottom: 20 }}>
          Consulte os últimos treinos registrados.
        </P>

        <R style={{ gap: 10, marginBottom: 22 }}>
          <Card style={{ flex: 1 }}>
            <Ionicons name="barbell-outline" color={C.yellow} size={23} />

            <Text
              style={{
                color: C.white,
                fontSize: 23,
                fontWeight: '900',
                marginTop: 9,
              }}
            >
              {loading ? '...' : items.length}
            </Text>

            <P>Registros</P>
          </Card>

          <Card style={{ flex: 1 }}>
            <Ionicons name="time-outline" color={C.yellow} size={23} />

            <Text
              style={{
                color: C.white,
                fontSize: 20,
                fontWeight: '900',
                marginTop: 9,
              }}
            >
              {loading ? '...' : formatMinutes(totalMinutes)}
            </Text>

            <P>Tempo concluído</P>
          </Card>
        </R>

        <H style={{ fontSize: 19 }}>Seus registros</H>

        {loading ? (
          <P>Carregando histórico...</P>
        ) : items.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="Nenhum treino registrado"
            description="Quando você finalizar um treino, ele aparecerá aqui."
          />
        ) : (
          items.map((item, index) => (
            <Card
              key={item.id || index}
              style={{ marginBottom: 11 }}
            >
              <R>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: C.surface2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="barbell-outline" color={C.yellow} size={23} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.white, fontWeight: '800' }}>
                    {item.title || 'Treino'}
                  </Text>

                  <P>{formatDate(item.createdAt)}</P>
                </View>

                <View
                  style={{
                    backgroundColor: item.completed ? '#26371E' : C.surface2,
                    paddingHorizontal: 9,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: item.completed ? C.green : C.muted,
                      fontSize: 10,
                      fontWeight: '800',
                    }}
                  >
                    {item.completed ? 'CONCLUÍDO' : 'PENDENTE'}
                  </Text>
                </View>
              </R>

              <View
                style={{
                  height: 1,
                  backgroundColor: C.line,
                  marginVertical: 13,
                }}
              />

              <R style={{ gap: 18 }}>
                <P>
                  <Ionicons name="time-outline" color={C.yellow} />{' '}
                  {formatMinutes(item.durationMinutes)}
                </P>

                <P>
                  <Ionicons name="fitness-outline" color={C.yellow} />{' '}
                  {item.exercises?.length || 0} exercícios
                </P>
              </R>
            </Card>
          ))
        )}

        <Button
          title="Voltar"
          secondary
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </Screen>
  );
}

// ========================================
// REGISTRAR EVOLUÇÃO
// ========================================

export function AddProgressScreen({ navigation }) {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [gain, setGain] = useState('');
  const [sets, setSets] = useState('');

  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim() || !group.trim() || !gain.trim() || !sets.trim()) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha todas as informações.'
      );

      return;
    }

    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    try {
      setBusy(true);

      await addProgress(user.uid, {
        name: name.trim(),
        group: group.trim(),
        gain: gain.trim(),
        sets: sets.trim(),
      });

      Alert.alert(
        'Evolução registrada!',
        'Seu registro foi salvo com sucesso.',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log('Erro ao salvar evolução:', error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar sua evolução.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 12, marginBottom: 20 }}
        >
          <Ionicons name="arrow-back" size={25} color={C.white} />
        </TouchableOpacity>

        <H style={{ fontSize: 27 }}>Registrar evolução</H>

        <P style={{ marginBottom: 23 }}>
          Registre seus resultados para acompanhar seu desenvolvimento.
        </P>

        <Field
          label="Nome do exercício"
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Supino reto"
          autoCapitalize="sentences"
        />

        <Field
          label="Grupo muscular"
          value={group}
          onChangeText={setGroup}
          placeholder="Ex.: Peito"
          autoCapitalize="words"
        />

        <Field
          label="Evolução da carga"
          value={gain}
          onChangeText={setGain}
          placeholder="Ex.: +5 kg"
          autoCapitalize="sentences"
        />

        <Field
          label="Séries e repetições"
          value={sets}
          onChangeText={setSets}
          placeholder="Ex.: 4x12"
        />

        <Button
          title="Salvar evolução"
          onPress={save}
          loading={busy}
          disabled={busy}
        />

        <Button
          title="Cancelar"
          secondary
          onPress={() => navigation.goBack()}
          disabled={busy}
        />
      </ScrollView>
    </Screen>
  );
}

// ========================================
// TELA DE PROGRESSO
// ========================================

export function ProgressScreen({ navigation }) {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const data = await readProgress(user.uid);
      setItems(data || []);
    } catch (error) {
      console.log('Erro ao carregar progresso:', error);

      Alert.alert(
        'Erro',
        'Não foi possível carregar sua evolução.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [user]);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <R style={{ justifyContent: 'space-between', marginTop: 14 }}>
          <H style={{ fontSize: 28 }}>Progresso</H>

          <TouchableOpacity onPress={loadProgress}>
            <Ionicons name="refresh-outline" color={C.yellow} size={23} />
          </TouchableOpacity>
        </R>

        <P style={{ marginBottom: 22 }}>
          Acompanhe seus registros de evolução.
        </P>

        <Card
          style={{
            marginBottom: 22,
            alignItems: 'center',
            paddingVertical: 22,
          }}
        >
          <Ionicons name="trending-up-outline" color={C.yellow} size={32} />

          <Text
            style={{
              color: C.white,
              fontSize: 30,
              fontWeight: '900',
              marginTop: 9,
            }}
          >
            {loading ? '...' : items.length}
          </Text>

          <P>Registros de evolução</P>
        </Card>

        <Button
          title="Registrar nova evolução"
          onPress={() => navigation.navigate('AddProgress')}
        />

        <H style={{ fontSize: 19, marginTop: 27 }}>
          Seus exercícios
        </H>

        {loading ? (
          <P>Carregando registros...</P>
        ) : items.length === 0 ? (
          <EmptyState
            icon="trending-up-outline"
            title="Nenhum registro ainda"
            description="Registre a evolução de um exercício para começar seu histórico."
          />
        ) : (
          items.map((item, index) => (
            <Card
              key={item.id || index}
              style={{ marginBottom: 10, padding: 14 }}
            >
              <R>
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 12,
                    backgroundColor: C.surface2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="barbell-outline" color={C.yellow} size={23} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: C.white,
                      fontWeight: '800',
                      fontSize: 14,
                    }}
                  >
                    {item.name || 'Exercício'}
                  </Text>

                  <P>{item.group || 'Grupo não informado'}</P>

                  <Text
                    style={{
                      color: C.yellow,
                      fontWeight: '700',
                      fontSize: 12,
                      marginTop: 5,
                    }}
                  >
                    {item.gain || 'Sem evolução informada'} •{' '}
                    {item.sets || 'Séries não informadas'}
                  </Text>
                </View>
              </R>

              <P style={{ marginTop: 10 }}>
                Registrado em: {formatDate(item.createdAt)}
              </P>
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

// ========================================
// TELA DE PERFIL
// ========================================

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.displayName || '');
  const [savedName, setSavedName] = useState(user?.displayName || '');

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
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
        console.log('Erro ao carregar perfil:', error);
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
    ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR')
    : 'Não disponível';

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Digite seu nome.');
      return;
    }

    try {
      setBusy(true);

      const newName = name.trim();

      await updateProfile(user, {
        displayName: newName,
      });

      await writeProfile(user.uid, {
        name: newName,
      });

      setName(newName);
      setSavedName(newName);
      setEditing(false);

      Alert.alert('Sucesso', 'Seu perfil foi atualizado.');
    } catch (error) {
      console.log('Erro ao atualizar perfil:', error);

      Alert.alert(
        'Erro',
        'Não foi possível atualizar seu perfil.'
      );
    } finally {
      setBusy(false);
    }
  };

  const cancelEdit = () => {
    setName(savedName);
    setEditing(false);
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza de que deseja sair do FitPro?',
      [
        { text: 'Cancelar', style: 'cancel' },
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
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        <H style={{ marginTop: 14, fontSize: 28 }}>
          Meu perfil
        </H>

        <P style={{ marginBottom: 22 }}>
          Gerencie sua conta e informações.
        </P>

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

          <P style={{ marginTop: 6 }}>
            {user?.email || 'E-mail não disponível'}
          </P>

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
            <Ionicons name="checkmark-circle" color={C.yellow} size={15} />

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

        <H style={{ fontSize: 19 }}>Resumo da conta</H>

        <R style={{ gap: 10, marginBottom: 24 }}>
          <Card style={{ flex: 1 }}>
            <Ionicons name="barbell-outline" color={C.yellow} size={23} />

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
          </Card>

          <Card style={{ flex: 1 }}>
            <Ionicons name="calendar-outline" color={C.yellow} size={23} />

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

        <R style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <H style={{ fontSize: 19, marginBottom: 0 }}>
            Dados pessoais
          </H>

          {!editing && (
            <TouchableOpacity
              onPress={() => setEditing(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons name="create-outline" color={C.yellow} size={18} />

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

        <H style={{ fontSize: 19, marginTop: 25 }}>
          Conta e segurança
        </H>

        <Card style={{ marginBottom: 12 }}>
          <R>
            <Ionicons
              name="shield-checkmark-outline"
              color={C.yellow}
              size={22}
            />

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: C.white, fontWeight: '700' }}>
                Autenticação
              </Text>

              <P>Conta protegida pelo Firebase</P>
            </View>

            <Ionicons
              name="checkmark-circle"
              color={C.yellow}
              size={20}
            />
          </R>
        </Card>

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
          <Ionicons name="log-out-outline" color={C.danger} size={21} />

          <Text
            style={{
              color: C.danger,
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
