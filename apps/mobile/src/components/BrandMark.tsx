import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, type } from '../theme';

type Props = {
  size?: 'sm' | 'lg';
  tagline?: boolean;
};

export function BrandMark({ size = 'lg', tagline = false }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[size === 'lg' ? type.heroBrand : styles.smallBrand, styles.brand]}>
        Find Money
      </Text>
      {tagline ? (
        <Text style={styles.tagline}>Your money-finding agent.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
  },
  brand: {
    color: colors.text,
  },
  smallBrand: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    color: colors.text,
  },
  tagline: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.mistMuted,
  },
});
