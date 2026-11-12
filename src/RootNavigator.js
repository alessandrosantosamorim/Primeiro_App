
import {
    ActivityIndicator,
    Text,
    View,
} from 'react-native';

import {
    DarkTheme,
    NavigationContainer,
} from '@react-navigation/native';

import {
    createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from './AuthContext';
import { C } from './theme';

import {
    ForgotPasswordScreen,
    LoginScreen,
    RegisterScreen,
} from './AuthScreens';

import {
    AddProgressScreen,
    ExerciseLibraryScreen,
    HomeScreen,
    ProfileScreen,
    ProgressScreen,
    WorkoutHistoryScreen,
    WorkoutSessionScreen,
    WorkoutsScreen,
} from './MainScreens';

import WorkoutPlanFormScreen from './WorkoutPlanFormScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ========================================
// NAVEGAÇÃO PRINCIPAL
// ========================================

function MainTabs() {
  const icons = {
    'Início': 'home',
    'Progresso': 'bar-chart',
    'Treinos': 'barbell',
    'Perfil': 'person',
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.line,
          height: 82,
          paddingTop: 8,
          paddingBottom: 15,
        },

        tabBarActiveTintColor: C.yellow,
        tabBarInactiveTintColor: C.muted,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },

        tabBarIcon: ({ color }) => (
          <Ionicons
            name={icons[route.name]}
            size={23}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Início"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Progresso"
        component={ProgressScreen}
      />

      <Tab.Screen
        name="Treinos"
        component={WorkoutsScreen}
      />

      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
}

// ========================================
// NAVEGADOR ROOT
// ========================================

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={C.yellow} />

        <Text
          style={{
            color: C.muted,
            marginTop: 12,
          }}
        >
          Carregando FitPro...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,

        colors: {
          ...DarkTheme.colors,
          background: C.bg,
          card: C.bg,
          text: C.white,
          border: C.line,
          primary: C.yellow,
        },
      }}
    >
      {user ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Main"
            component={MainTabs}
          />

          <Stack.Screen
            name="WorkoutSession"
            component={WorkoutSessionScreen}
          />

          <Stack.Screen
            name="ExerciseLibrary"
            component={ExerciseLibraryScreen}
          />

          <Stack.Screen
            name="WorkoutHistory"
            component={WorkoutHistoryScreen}
          />

          <Stack.Screen
            name="AddProgress"
            component={AddProgressScreen}
          />

          <Stack.Screen
            name="WorkoutPlanForm"
            component={WorkoutPlanFormScreen}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
          />

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
