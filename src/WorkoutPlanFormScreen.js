
import { useState } from 'react';

import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from './AuthContext';

import {
    addWorkoutPlan,
    updateWorkoutPlan,
} from './data';

import { exercises } from './MainScreens';
import { C } from './theme';
import { Button, Card, Screen } from './UI';

export default function WorkoutPlanFormScreen({ navigation, route }) {
  const { user } = useAuth();

  const editingPlan = route.params?.plan || null;

  const [name, setName] = useState(editingPlan?.name || '');

  const [selectedExercises, setSelectedExercises] = useState(
    editingPlan?.exercises || []
  );

  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  // ========================================
  // ADICIONAR EXERCÍCIO
  // ========================================

  const addExercise = exercise => {
    const alreadyAdded = selectedExercises.some(
      item => item.name === exercise.name
    );

    if (alreadyAdded) {
      Alert.alert(
        'Exercício já adicionado',
        'Esse exercício já está no seu treino.'
      );

      return;
    }

    const [defaultSets, defaultReps] = exercise.sets
      .split('x')
      .map(Number);

    setSelectedExercises(current => [
      ...current,
      {
        name: exercise.name,
        group: exercise.group,
        sets: defaultSets || 3,
        reps: defaultReps || 12,
        restSeconds: 60,
      },
    ]);
  };

  // ========================================
  // REMOVER EXERCÍCIO
  // ========================================

  const removeExercise = index => {
    setSelectedExercises(current =>
      current.filter((item, i) => i !== index)
    );
  };

  // ========================================
  // EDITAR CONFIGURAÇÕES
  // ========================================

  const updateExercise = (index, field, value) => {
    setSelectedExercises(current =>
      current.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // ========================================
  // SALVAR TREINO
  // ========================================

  const savePlan = async () => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (!name.trim()) {
      Alert.alert(
        'Nome obrigatório',
        'Digite o nome do treino.'
      );

      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert(
        'Adicione exercícios',
        'Seu treino precisa ter pelo menos um exercício.'
      );

      return;
    }

    const invalidExercise = selectedExercises.some(item => {
      const sets = Number(item.sets);
      const reps = Number(item.reps);
      const rest = Number(item.restSeconds);

      return (
        !Number.isInteger(sets) ||
        sets < 1 ||
        !Number.isInteger(reps) ||
        reps < 1 ||
        !Number.isInteger(rest) ||
        rest < 0
      );
    });

    if (invalidExercise) {
      Alert.alert(
        'Valores inválidos',
        'Confira as séries, repetições e descanso de cada exercício.'
      );

      return;
    }

    const planData = {
      name: name.trim(),

      exercises: selectedExercises.map(item => ({
        name: item.name,
        group: item.group,
        sets: Number(item.sets),
        reps: Number(item.reps),
        restSeconds: Number(item.restSeconds),
      })),
    };

    try {
      setBusy(true);

      if (editingPlan?.id) {
        await updateWorkoutPlan(
          user.uid,
          editingPlan.id,
          planData
        );
      } else {
        await addWorkoutPlan(user.uid, planData);
      }

      Alert.alert(
        'Sucesso!',
        editingPlan
          ? 'Seu treino foi atualizado.'
          : 'Seu treino foi salvo.',
        [
          {
            text: 'Continuar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.log('Erro ao salvar treino:', error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar o treino.'
      );
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // PESQUISA
  // ========================================

  const filteredExercises = exercises.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // ========================================
  // TELA
  // ========================================

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginTop: 12,
            marginBottom: 20,
          }}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color={C.white}
          />
        </TouchableOpacity>

        <Text
          style={{
            color: C.white,
            fontSize: 27,
            fontWeight: '900',
            marginBottom: 7,
          }}
        >
          {editingPlan ? 'Editar treino' : 'Criar treino'}
        </Text>

        <Text
          style={{
            color: C.muted,
            fontSize: 13,
            marginBottom: 22,
          }}
        >
          Monte sua rotina e configure cada exercício.
        </Text>

        <Card style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: C.white,
              fontWeight: '800',
              marginBottom: 10,
            }}
          >
            Nome do treino
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex.: Treino de peito"
            placeholderTextColor={C.muted}
            autoCapitalize="sentences"
            style={{
              backgroundColor: C.surface2,
              color: C.white,
              borderRadius: 10,
              padding: 14,
              borderWidth: 1,
              borderColor: C.line,
            }}
          />
        </Card>

        <Text
          style={{
            color: C.white,
            fontSize: 19,
            fontWeight: '900',
            marginBottom: 12,
          }}
        >
          Exercícios selecionados ({selectedExercises.length})
        </Text>

        {selectedExercises.length === 0 && (
          <Text
            style={{
              color: C.muted,
              marginBottom: 15,
            }}
          >
            Ainda não há exercícios. Escolha na biblioteca abaixo.
          </Text>
        )}

        {selectedExercises.map((item, index) => (
          <Card
            key={item.name}
            style={{ marginBottom: 12 }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text
                  style={{
                    color: C.white,
                    fontSize: 15,
                    fontWeight: '800',
                  }}
                >
                  {index + 1}. {item.name}
                </Text>

                <Text
                  style={{
                    color: C.muted,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {item.group}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => removeExercise(index)}
              >
                <Ionicons
                  name="trash-outline"
                  color={C.danger}
                  size={21}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                gap: 8,
              }}
            >
              {[
                {
                  label: 'Séries',
                  field: 'sets',
                  value: item.sets,
                },
                {
                  label: 'Repetições',
                  field: 'reps',
                  value: item.reps,
                },
                {
                  label: 'Descanso (s)',
                  field: 'restSeconds',
                  value: item.restSeconds,
                },
              ].map(input => (
                <View key={input.field} style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: C.muted,
                      fontSize: 11,
                      marginBottom: 6,
                    }}
                  >
                    {input.label}
                  </Text>

                  <TextInput
                    value={String(input.value)}
                    onChangeText={value =>
                      updateExercise(
                        index,
                        input.field,
                        value.replace(/[^0-9]/g, '')
                      )
                    }
                    keyboardType="numeric"
                    selectTextOnFocus
                    style={{
                      backgroundColor: C.surface2,
                      color: C.white,
                      borderRadius: 9,
                      padding: 11,
                      textAlign: 'center',
                      borderWidth: 1,
                      borderColor: C.line,
                    }}
                  />
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Text
          style={{
            color: C.white,
            fontSize: 19,
            fontWeight: '900',
            marginTop: 15,
            marginBottom: 12,
          }}
        >
          Biblioteca de exercícios
        </Text>

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Pesquisar exercício..."
          placeholderTextColor={C.muted}
          style={{
            backgroundColor: C.surface,
            color: C.white,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: C.line,
            marginBottom: 13,
          }}
        />

        {filteredExercises.map(item => {
          const added = selectedExercises.some(
            selected => selected.name === item.name
          );

          return (
            <TouchableOpacity
              key={item.name}
              disabled={added}
              onPress={() => addExercise(item)}
              activeOpacity={0.7}
            >
              <Card
                style={{
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: added ? 0.5 : 1,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: C.white,
                      fontWeight: '800',
                    }}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      color: C.muted,
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    {item.group} • {item.sets}
                  </Text>
                </View>

                <Ionicons
                  name={added ? 'checkmark-circle' : 'add-circle'}
                  color={added ? C.green : C.yellow}
                  size={25}
                />
              </Card>
            </TouchableOpacity>
          );
        })}

        <View style={{ marginTop: 15 }}>
          <Button
            title={editingPlan ? 'Salvar alterações' : 'Salvar treino'}
            onPress={savePlan}
            loading={busy}
            disabled={busy}
          />

          <Button
            title="Cancelar"
            secondary
            onPress={() => navigation.goBack()}
            disabled={busy}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
