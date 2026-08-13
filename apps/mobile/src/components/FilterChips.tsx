import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { CategoryFilter } from '@find-money/shared';
import { OPPORTUNITY_CATEGORIES } from '@find-money/shared';
import { colors, fonts, radii, space } from '../theme';

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  ...Object.values(OPPORTUNITY_CATEGORIES).map((c) => ({
    id: c.id as CategoryFilter,
    label: c.label,
  })),
];

type Props = {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
};

export function FilterChips({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {FILTERS.map((f) => {
        const active = f.id === value;
        return (
          <Pressable
            key={f.id}
            onPress={() => onChange(f.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{f.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: space.md,
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: space.sm,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.mist,
    borderColor: colors.mist,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.textDark,
  },
});
