import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import Recipe from '../../../models/recipe.model';
import User from '../../../models/user.model';

type Props = {
  authenticatedUser: User | null
  user: User
  recipes: Recipe[]
  onLogout: () => void
}

export default function Header({ authenticatedUser, user, recipes, onLogout }: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/banner.jpg')}
          resizeMode="cover"
          style={styles.banner}
        />

        <View style={styles.headerButtons}>
          <Ionicons
            name="logo-github"
            size={24}
            color="#000"
            onPress={() => Linking.openURL(user.url)}
            style={styles.headerButton}
          />

          {(authenticatedUser && user.id == authenticatedUser.id) && (
            <MaterialIcons
              name="logout"
              size={24}
              color="#000"
              onPress={() => onLogout()}
              style={styles.headerButton}
            />
          )}
        </View>

        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.username}>
        {user.name ?? user.pseudo}
      </Text>
      <Text style={styles.pseudo}>
        @{user.pseudo}
      </Text>

      <Text style={styles.bio}>
        {user.bio}
      </Text>

      <View style={styles.metas}>
        <View style={styles.meta}>
          <Text style={styles.metaValue}>
            {recipes.length}
          </Text>
          <Text style={styles.metaLabel}>
            Recettes
          </Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.meta}>
          <Text style={styles.metaValue}>
            {user.followers}
          </Text>
          <Text style={styles.metaLabel}>
            Abonnés
          </Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.meta}>
          <Text style={styles.metaValue}>
            {user.following}
          </Text>
          <Text style={styles.metaLabel}>
            Abonnements
          </Text>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  banner: {
    width: '100%',
    height: 200,
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    gap: 16,
    margin: 16,
  },
  headerButton: {
    backgroundColor: '#fff',
    borderRadius: 360,
    padding: 8,
  },
  avatar: {
    position: 'absolute',
    bottom: 0,
    width: 100,
    height: 100,
    borderColor: '#fff',
    borderRadius: 360,
    borderWidth: 6,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  pseudo: {
    color: '#a1a1a1',
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  bio: {
    marginTop: 12,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  metas: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  meta: {
    alignItems: 'center',
    flex: 1,
  },
  metaValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metaLabel: {},
  metaDivider: {
    width: 1,
    backgroundColor: '#EAEDE8',
  },
})
