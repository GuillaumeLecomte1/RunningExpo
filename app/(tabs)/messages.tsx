import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const messages = [
  {
    id: 1,
    sender: 'Coach Thomas',
    lastMessage: 'Excellent progrès cette semaine ! Continuez ainsi 💪',
    time: '14:30',
    unread: true,
    avatar: '👨‍🏫'
  },
  {
    id: 2,
    sender: 'Groupe Running Club',
    lastMessage: 'Qui est partant pour une course dimanche matin ?',
    time: 'Hier',
    unread: true,
    avatar: '👥'
  },
  {
    id: 3,
    sender: 'Support RunApp',
    lastMessage: 'Merci de votre retour. Nous avons bien...',
    time: '23 Nov',
    unread: false,
    avatar: '🛟'
  }
];

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6B5ECD', '#8B7FE8']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Messages</ThemedText>
          </View>

          {/* Messages List */}
          <View style={styles.messagesList}>
            {messages.map((message) => (
              <Pressable
                key={message.id}
                style={({ pressed }) => [
                  styles.messageItem,
                  pressed && styles.messageItemPressed
                ]}
                onPress={() => router.push({
                  pathname: '/message-details',
                  params: { id: message.id }
                })}
              >
                <View style={styles.avatarContainer}>
                  <ThemedText style={styles.avatar}>{message.avatar}</ThemedText>
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <ThemedText style={styles.senderName}>{message.sender}</ThemedText>
                    <ThemedText style={styles.messageTime}>{message.time}</ThemedText>
                  </View>
                  <View style={styles.messagePreview}>
                    <ThemedText 
                      style={[
                        styles.messageText,
                        message.unread && styles.unreadText
                      ]}
                      numberOfLines={1}
                    >
                      {message.lastMessage}
                    </ThemedText>
                    {message.unread && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Espace pour la barre de navigation */}
          <View style={{ height: 104 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  messagesList: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  messageItemPressed: {
    backgroundColor: '#f8f8f8',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    fontSize: 24,
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  messageTime: {
    fontSize: 14,
    color: '#666',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  unreadText: {
    color: '#000',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B5ECD',
    marginLeft: 8,
  }
});
