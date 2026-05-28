import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCartStore } from '../store/useCartStore';

export default function CartButton() {
  const router = useRouter();
  const pathname = usePathname(); // Tracks the current active screen
  
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);

  // If the cart is empty OR we are already inside the Cart Screen, hide this button
  if (items.length === 0 || pathname === '/cart') return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/cart')}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems}</Text>
        </View>
        
        <Text style={styles.buttonText}>Ver Carrito</Text>
        
        <Text style={styles.priceText}>C$ {getTotal()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 50,
  },
  button: {
    backgroundColor: '#b91c1c',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  badge: {
    backgroundColor: '#7f1d1d',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});