import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { colors, fonts, radii, space, type } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const CARDS = [
  { emoji: '💸', title: 'Recover', body: 'Find money you’re owed.' },
  { emoji: '🧾', title: 'Save', body: 'Find expenses you can eliminate or reduce.' },
  { emoji: '🎁', title: 'Claim', body: 'Find benefits, credits and rewards you’re not using.' },
];

export function OnboardingScreen({ navigation }: Props) {
  return (
    <Screen contentStyle={styles.content}>
      <Text style={styles.question}>How much money are you leaving behind?</Text>
      <Text style={styles.support}>
        Find Money looks for money you could recover, save, claim, or prevent from being lost.
      </Text>

      <View style={styles.cards}>
        {CARDS.map((card) => (
          <View key={card.title} style={styles.card}>
            <Text style={styles.emoji}>{card.emoji}</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardBody}>{card.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button label="Find My Money" onPress={() => navigation.navigate('Promise')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: space.xl,
  },
  question: {
    ...type.hero,
    color: colors.text,
    marginBottom: space.md,
  },
  support: {
    ...type.body,
    color: colors.textMuted,
    marginBottom: space.xl,
  },
  cards: {
    gap: space.md,
    marginBottom: space.xl,
  },
  card: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radii.md,
    backgroundColor: colors.inkElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 28,
    marginTop: 2,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 4,
  },
  cardBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
